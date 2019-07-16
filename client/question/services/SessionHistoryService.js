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
  'LocalStorageKeyManagerService', 'SpeechBalloonObjectFactory',
  'FeedbackParagraphObjectFactory', 'DURATION_MSEC_WAIT_FOR_FEEDBACK',
  'DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION',
  function(
      $timeout, CurrentQuestionService, LocalStorageService,
      LocalStorageKeyManagerService, SpeechBalloonObjectFactory,
      FeedbackParagraphObjectFactory, DURATION_MSEC_WAIT_FOR_FEEDBACK,
      DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION) {
    var data = {
      // A list of SpeechBalloon objects, from newest to oldest.
      sessionTranscript: [],
      // The number of pending speech balloons to add to the transcript.
      numBalloonsPending: 0,
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
        data.numBalloonsPending = 0;
        data.snapshotIndex = 0;

        var questionId = CurrentQuestionService.getCurrentQuestionId();
        localStorageKey = (
          LocalStorageKeyManagerService.getSessionHistoryKey(
            questionId, data.snapshotIndex));

        var potentialSessionTranscript = LocalStorageService.get(
          localStorageKey);

        if (potentialSessionTranscript !== null) {
          while (potentialSessionTranscript !== null) {
            data.snapshotIndex++;
            localStorageKey = (
              LocalStorageKeyManagerService.getSessionHistoryKey(
                questionId, data.snapshotIndex));
            potentialSessionTranscript = LocalStorageService.get(
              localStorageKey);
            // LocalStorageService.delete(localStorageKey);
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
        localStorageKey = (
          LocalStorageKeyManagerService.getSessionHistoryKey(
            questionId, 0
          )
        );
        if (LocalStorageService.get(localStorageKey) === null) {
          throw Error('Cannot retrieve starter code from local storage.');
        } else {
          return LocalStorageService.get(
            localStorageKey)[0].feedbackParagraphDicts[0].content;
        }
      },
      /**
       * Returns the code from a previous snapshot.
       */
      getPreviousSnapshot: function(snapshotIndex) {
        if (snapshotIndex <= data.snapshotIndex) {
          var questionId = CurrentQuestionService.getCurrentQuestionId();
          localStorageKey = (
            LocalStorageKeyManagerService.getSessionHistoryKey(
              questionId, snapshotIndex
            )
          );
          if (LocalStorageService.get(localStorageKey) === null) {
            throw Error('Cannot retrieve snapshot index ' + snapshotIndex +
              ' from local storage.');
          } else {
            return LocalStorageService.get(
              localStorageKey)[1].feedbackParagraphDicts[0].content;
          }
        } else {
          throw Error('Requested snapshot index ' + snapshotIndex +
            ' is out of range.');
        }
      },
      /**
       * Saves code as a snapshot when it is not submitted as a
       * new code balloon.
       */
      saveSnapshot: function(codeEditorContent) {
        data.sessionTranscript.unshift(
          SpeechBalloonObjectFactory.createCodeBalloon(
            codeEditorContent
          ));
        var questionId = CurrentQuestionService.getCurrentQuestionId();
        // Store as a new snapshot.
        localStorageKey = (
          LocalStorageKeyManagerService.getSessionHistoryKey(
            questionId, 0));
        LocalStorageService.put(
          localStorageKey,
          data.sessionTranscript.map(function(speechBalloon) {
            return speechBalloon.toDict();
          })
        );
        // Reset in order to not add a new code balloon.
        data.sessionTranscript.length = 0;
        data.numBalloonsPending = 0;
      },
      /**
       * Adds a new code balloon to the beginning of the list.
       */
      addCodeBalloon: function(submittedCode) {
        data.sessionTranscript.unshift(
          SpeechBalloonObjectFactory.createCodeBalloon(submittedCode));
        var questionId = CurrentQuestionService.getCurrentQuestionId();
        // Increment the snapshot number to create a new submission key.
        // Store as a new snapshot.
        data.snapshotIndex++;
        localStorageKey = (
          LocalStorageKeyManagerService.getSessionHistoryKey(
            questionId, data.snapshotIndex));
        LocalStorageService.put(
          localStorageKey,
          data.sessionTranscript.map(function(speechBalloon) {
            return speechBalloon.toDict();
          })
        );
        // We increment the number of balloons here, because adding a
        // code balloon implies that a feedback balloon will soon follow.
        data.numBalloonsPending++;
      },
      /**
       * Adds a new feedback balloon to the beginning of the list.
       */
      addFeedbackBalloon: function(feedbackParagraphs) {
        $timeout(function() {
          data.sessionTranscript.unshift(
            SpeechBalloonObjectFactory.createFeedbackBalloon(
              feedbackParagraphs));
          // This signifies that the feedback balloon has been added and
          // thus completes the code-feedback pairing as there is a feedback
          // balloon for every code balloon.
          data.numBalloonsPending--;

          LocalStorageService.put(
            localStorageKey,
            data.sessionTranscript.map(function(speechBalloon) {
              return speechBalloon.toDict();
            })
          );
        }, DURATION_MSEC_WAIT_FOR_FEEDBACK);
      },
      /**
       * Adds a new feedback balloon to the beginning of the list which
       * informs the user that their code was submitted.
       */
      addSubmissionConfirmationBalloon: function() {
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
          SpeechBalloonObjectFactory.createFeedbackBalloon(
            [submissionParagraph]));

          LocalStorageService.put(
            localStorageKey,
            data.sessionTranscript.map(function(speechBalloon) {
              return speechBalloon.toDict();
            })
          );
        }, DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION);

        // Since clicking "Submit for Grading" shows both a copy of the
        // code submitted as well as the feedback text confirmation,
        // adding this feedback balloon completes the code-feedback pairing.
        data.numBalloonsPending--;
      },
      /**
       * Adds a new feedback balloon to the beginning of the list which
       * introduces TIE. Specifically, this intro balloon only appears when
       * TIE is iframed, which also removes the question from the feedback
       * window.
       */
      addIntroMessageBalloon: function() {
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
            SpeechBalloonObjectFactory.createFeedbackBalloon([introParagraph]));
        LocalStorageService.put(
          localStorageKey,
          data.sessionTranscript.map(function(speechBalloon) {
            return speechBalloon.toDict();
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
        data.numBalloonsPending = 0;
        LocalStorageService.delete(localStorageKey);
      },
      /**
       * Returns whether a new balloon is pending.
       */
      isNewBalloonPending: function() {
        return data.numBalloonsPending > 0;
      },
      data: data
    };
  }
]);
