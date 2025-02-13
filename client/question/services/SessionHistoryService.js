// Copyright 2017 The TIE Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A service that maintains a local session transcript of TIE's
 * code submission and feedback history, used to populate the conversation log
 * in the TIE UI.
 */

tie.factory('SessionHistoryService', [
  '$timeout', 'CurrentQuestionService', 'LocalStorageService',
  'LocalStorageKeyManagerService', 'TranscriptParagraphObjectFactory',
  'FeedbackParagraphObjectFactory', 'DURATION_MSEC_WAIT_FOR_FEEDBACK',
  'DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION',
  function(
      $timeout, CurrentQuestionService, LocalStorageService,
      LocalStorageKeyManagerService, TranscriptParagraphObjectFactory,
      FeedbackParagraphObjectFactory, DURATION_MSEC_WAIT_FOR_FEEDBACK,
      DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION) {
    var data = {
      // A list of TranscriptParagraph objects, from newest to oldest.
      sessionTranscript: [],
      // The number of pending paragraphs to add to the transcript.
      numParagraphsPending: 0,
      snapshotIndex: 0
    };

    var localStorageKey = null;

    return {
      /**
       * Clears the session history data, and loads it from local storage (if
       * applicable).
       */
      init: function() {
        if (!CurrentQuestionService.isInitialized()) {
          throw Error(
            'CurrentQuestionService must be initialized before ' +
            'SessionHistoryService');
        }

        data.sessionTranscript.length = 0;
        data.numParagraphsPending = 0;
        data.snapshotIndex = 0;

        var questionId = CurrentQuestionService.getCurrentQuestionId();
        var tieId = LocalStorageService.getTieId();
        localStorageKey = (
          LocalStorageKeyManagerService.getSessionHistoryKey(
            tieId, questionId, data.snapshotIndex));

        var potentialSessionTranscript = LocalStorageService.get(
          localStorageKey);
        var code = null;
        var feedbackParagraphs = null;

        if (potentialSessionTranscript !== null) {
          while (potentialSessionTranscript !== null) {
            data.snapshotIndex++;
            localStorageKey = (
              LocalStorageKeyManagerService.getSessionHistoryKey(
                tieId, questionId, data.snapshotIndex));
            potentialSessionTranscript = LocalStorageService.get(
              localStorageKey);
            if (potentialSessionTranscript !== null) {
              code = potentialSessionTranscript[
                1].feedbackParagraphContentDicts[0].content;
              feedbackParagraphs = TranscriptParagraphObjectFactory.fromDict(
                potentialSessionTranscript[0]).getFeedbackParagraphs();
              data.sessionTranscript.unshift(
                TranscriptParagraphObjectFactory.createCodeParagraph(
                  code, data.snapshotIndex));
              data.sessionTranscript.unshift(
               TranscriptParagraphObjectFactory.createFeedbackParagraph(
                 feedbackParagraphs, data.snapshotIndex));
            }
          }
          data.snapshotIndex--;
        }
      },
      /**
       * Returns a bindable reference to the session transcript.
       */
      getBindableSessionTranscript: function() {
        return data.sessionTranscript;
      },
      /**
       * Returns the current snapshot number.
       */
      getSnapshotIndex: function() {
        return data.snapshotIndex;
      },
      /**
       * Returns the starter code, which has a snapshot index of 0.
       */
      getStarterCodeSnapshot: function() {
        var questionId = CurrentQuestionService.getCurrentQuestionId();
        var tieId = LocalStorageService.getTieId();
        localStorageKey = (
          LocalStorageKeyManagerService.getSessionHistoryKey(
            tieId, questionId, 0
          )
        );
        if (LocalStorageService.get(localStorageKey) === null) {
          throw Error('Cannot retrieve starter code from local storage.');
        } else {
          return LocalStorageService.get(
            localStorageKey)[0].feedbackParagraphContentDicts[0].content;
        }
      },
      /**
       * Returns the code from a previous snapshot.
       */
      getPreviousSnapshot: function(snapshotIndex) {
        if (snapshotIndex > 0 && snapshotIndex <= data.snapshotIndex) {
          var questionId = CurrentQuestionService.getCurrentQuestionId();
          var tieId = LocalStorageService.getTieId();
          localStorageKey = (
            LocalStorageKeyManagerService.getSessionHistoryKey(
              tieId, questionId, snapshotIndex
            )
          );
          if (LocalStorageService.get(localStorageKey) === null) {
            throw Error('Cannot retrieve snapshot index ' + snapshotIndex +
              ' from local storage.');
          } else {
            return LocalStorageService.get(
              localStorageKey)[1].feedbackParagraphContentDicts[0].content;
          }
        } else {
          throw Error('Requested snapshot index ' + snapshotIndex +
            ' is out of range.');
        }
      },
      /**
       * Returns the feedback from a previous snapshot.
       */
      getPreviousFeedback: function(snapshotIndex) {
        if (snapshotIndex > 0 && snapshotIndex <= data.snapshotIndex) {
          var questionId = CurrentQuestionService.getCurrentQuestionId();
          var tieId = LocalStorageService.getTieId();
          localStorageKey = (
            LocalStorageKeyManagerService.getSessionHistoryKey(
              tieId, questionId, snapshotIndex
            )
          );
          if (LocalStorageService.get(localStorageKey) === null) {
            throw Error('Cannot retrieve snapshot index ' + snapshotIndex +
              ' from local storage.');
          } else {
            return LocalStorageService.get(
              localStorageKey)[0].feedbackParagraphContentDicts;
          }
        } else {
          throw Error('Requested snapshot index ' + snapshotIndex +
            ' is out of range.');
        }
      },
      /**
       * Saves starter code as a snapshot.
       */
      saveStarterCodeSnapshot: function(codeEditorContent) {
        data.sessionTranscript.unshift(
          TranscriptParagraphObjectFactory.createCodeParagraph(
            codeEditorContent, data.snapshotIndex));
        var questionId = CurrentQuestionService.getCurrentQuestionId();
        var tieId = LocalStorageService.getTieId();
        // Store as a new snapshot.
        localStorageKey = (
          LocalStorageKeyManagerService.getSessionHistoryKey(
            tieId, questionId, 0));
        LocalStorageService.put(
          localStorageKey,
          data.sessionTranscript.map(function(transcriptParagraph) {
            return transcriptParagraph.toDict();
          })
        );
      },
      /**
       * Adds a new code paragraph to the beginning of the list.
       */
      addCodeToTranscript: function(submittedCode) {
        // Increment the snapshot number to create a new submission key.
        data.snapshotIndex++;
        data.sessionTranscript.unshift(
          TranscriptParagraphObjectFactory.createCodeParagraph(
            submittedCode, data.snapshotIndex));
        var questionId = CurrentQuestionService.getCurrentQuestionId();
        var tieId = LocalStorageService.getTieId();
        // Store as a new snapshot.
        localStorageKey = (
          LocalStorageKeyManagerService.getSessionHistoryKey(
            tieId, questionId, data.snapshotIndex));
        LocalStorageService.put(
          localStorageKey,
          data.sessionTranscript.map(function(transcriptParagraph) {
            return transcriptParagraph.toDict();
          })
        );
        // We increment the number of paragraphs here, because adding a
        // code paragraph implies that a feedback paragraph will soon follow.
        data.numParagraphsPending++;
      },
      /**
       * Adds a new feedback paragraph to the beginning of the list.
       */
      addFeedbackToTranscript: function(feedbackParagraphs) {
        $timeout(function() {
          data.sessionTranscript.unshift(
            TranscriptParagraphObjectFactory.createFeedbackParagraph(
              feedbackParagraphs, data.snapshotIndex));
          // This signifies that the feedback paragraph has been added and
          // thus completes the code-feedback pairing as there is a feedback
          // paragraph for every code paragraph.
          data.numParagraphsPending--;

          LocalStorageService.put(
            localStorageKey,
            data.sessionTranscript.map(function(transcriptParagraph) {
              return transcriptParagraph.toDict();
            })
          );
        }, DURATION_MSEC_WAIT_FOR_FEEDBACK);
      },
      /**
       * Adds a new feedback paragraph to the beginning of the list which
       * informs the user that their code was submitted.
       */
      addSubmissionConfirmationToTranscript: function() {
        var submissionText = [
          'Your code has been submitted for grading. ',
          'Feel free to continue working on the exercise, ask for feedback ',
          'by clicking the "Get Feedback" button, or submit again with ',
          'the "Submit for Grading" button.'
        ].join('\n');
        var submissionParagraph =
          FeedbackParagraphObjectFactory.createTextParagraph(submissionText);
        $timeout(function() {
          data.sessionTranscript.unshift(
          TranscriptParagraphObjectFactory.createFeedbackParagraph(
            [submissionParagraph], data.snapshotIndex));

          LocalStorageService.put(
            localStorageKey,
            data.sessionTranscript.map(function(transcriptParagraph) {
              return transcriptParagraph.toDict();
            })
          );
        }, DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION);

        // Since clicking "Submit for Grading" adds both a copy of the
        // code submitted as well as the feedback text confirmation,
        // adding this feedback paragraph completes the code-feedback pairing.
        data.numParagraphsPending--;
      },
      /**
       * Adds a new feedback paragraph to the beginning of the list which
       * introduces TIE. Specifically, this intro paragraph only appears when
       * TIE is iframed, which also removes the question from the feedback
       * window.
       */
      addIntroMessageToTranscript: function() {
        var introText = [
          'Code your answer in the coding window. You can click the ',
          '"Get Feedback" button at any time to get feedback on your ',
          'code (which will not be submitted for grading/credit). When you ',
          'are ready to submit your code for grading/credit, click the ',
          '"Submit for Grading" button.'
        ].join('\n');
        var introParagraph =
          FeedbackParagraphObjectFactory.createTextParagraph(introText);
        data.sessionTranscript.unshift(
            TranscriptParagraphObjectFactory.createFeedbackParagraph(
              [introParagraph], data.snapshotIndex));
        LocalStorageService.put(
          localStorageKey,
          data.sessionTranscript.map(function(transcriptParagraph) {
            return transcriptParagraph.toDict();
          })
        );
      },
      /**
       * Resets the session transcript and clears it from local storage.
       */
      reset: function() {
        // Setting the length of the existing array to 0 allows us to preserve
        // the binding to data.sessionTranscript.
        data.sessionTranscript.length = 0;
        data.numParagraphsPending = 0;
        LocalStorageService.delete(localStorageKey);
      },
      /**
       * Returns whether a new paragraph from the transcript is pending.
       */
      isNewTranscriptParagraphPending: function() {
        return data.numParagraphsPending > 0;
      },
      data: data
    };
  }
]);
