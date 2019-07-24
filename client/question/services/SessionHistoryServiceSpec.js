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
 * @fileoverview Unit tests for the SessionHistoryService.
 */

describe('SessionHistoryService', function() {
  var SessionHistoryService;
  var FeedbackParagraphObjectFactory;
  var DURATION_MSEC_WAIT_FOR_FEEDBACK;
  var DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION;
  var $timeout;

  beforeEach(module('tie'));
  beforeEach(inject(function($injector, _$timeout_) {
    SessionHistoryService = $injector.get('SessionHistoryService');
    FeedbackParagraphObjectFactory = $injector.get(
      'FeedbackParagraphObjectFactory');
    DURATION_MSEC_WAIT_FOR_FEEDBACK = $injector.get(
      'DURATION_MSEC_WAIT_FOR_FEEDBACK');
    DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION = $injector.get(
      'DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION');
    $timeout = _$timeout_;
  }));

  describe('core behaviour', function() {
    it('should retrieve the correct previous snapshot', function() {
      SessionHistoryService.addCodeToTranscript('first submission');
      var firstSnapshotIndex = SessionHistoryService.getSnapshotIndex();
      SessionHistoryService.addFeedbackToTranscript([
        FeedbackParagraphObjectFactory.fromDict({
          type: 'text',
          content: 'first feedback'
        })
      ]);
      $timeout.flush(DURATION_MSEC_WAIT_FOR_FEEDBACK);

      SessionHistoryService.addCodeToTranscript('second submission');
      var secondSnapshotIndex = SessionHistoryService.getSnapshotIndex();
      SessionHistoryService.addFeedbackToTranscript([
        FeedbackParagraphObjectFactory.fromDict({
          type: 'text',
          content: 'second feedback'
        })
      ]);
      $timeout.flush(DURATION_MSEC_WAIT_FOR_FEEDBACK);

      expect(SessionHistoryService.getPreviousSnapshot(
        firstSnapshotIndex)).toEqual('first submission');
      expect(SessionHistoryService.getPreviousSnapshot(
        secondSnapshotIndex)).toEqual('second submission');
    });

    it('should retrieve the correct starter code snapshot', function() {
      var transcript = SessionHistoryService.getBindableSessionTranscript();
      SessionHistoryService.reset();
      expect(transcript.length).toBe(0);

      SessionHistoryService.saveStarterCodeSnapshot('starter code');

      SessionHistoryService.addCodeToTranscript('first submission');
      var firstSnapshotIndex = SessionHistoryService.getSnapshotIndex();
      SessionHistoryService.addFeedbackToTranscript([
        FeedbackParagraphObjectFactory.fromDict({
          type: 'text',
          content: 'first feedback'
        })
      ]);
      $timeout.flush(DURATION_MSEC_WAIT_FOR_FEEDBACK);

      expect(SessionHistoryService.getStarterCodeSnapshot(
        )).toEqual('starter code');
      expect(SessionHistoryService.getPreviousSnapshot(
        firstSnapshotIndex)).toEqual('first submission');

      // Testing retrieving snapshot with invalid index.
      expect(function() {
        SessionHistoryService.getPreviousSnapshot(-1);
      }).toThrow(new Error('Requested snapshot index -1 is out of range.'));
    });

    it('should add a new code paragraph correctly', function() {
      var transcript = SessionHistoryService.getBindableSessionTranscript();
      expect(transcript.length).toBe(0);

      var snapshotIndex = SessionHistoryService.getSnapshotIndex();

      SessionHistoryService.addCodeToTranscript('some code');

      expect(transcript.length).toBe(1);
      expect(snapshotIndex).toBe(
        SessionHistoryService.getSnapshotIndex() - 1);
      var firstParagraph = transcript[0];
      expect(firstParagraph.isCodeSubmission()).toBe(true);
      var firstParagraphContent = firstParagraph.getFeedbackParagraphs();
      expect(firstParagraphContent.length).toBe(1);
      expect(firstParagraphContent[0].toDict()).toEqual({
        type: 'code',
        content: 'some code'
      });
    });

    it('should add an intro paragraph correctly', function() {
      var transcript = SessionHistoryService.getBindableSessionTranscript();
      expect(transcript.length).toBe(0);

      SessionHistoryService.addIntroMessageToTranscript();

      expect(transcript.length).toBe(1);
      expect(SessionHistoryService.isNewTranscriptParagraphPending()).toBe(
        false);
      var firstParagraph = transcript[0];
      var firstParagraphContent = firstParagraph.getFeedbackParagraphs();
      expect(firstParagraphContent.length).toBe(1);
      expect(firstParagraphContent[0].toDict()).toEqual({
        type: 'text',
        content: [
          'Code your answer in the coding window. You can click the ',
          '"Get Feedback" button at any time to get feedback on your ',
          'code (which will not be submitted for grading/credit). When you ',
          'are ready to submit your code for grading/credit, click the ',
          '"Submit for Grading" button.'
        ].join('\n')
      });
    });

    it('should add new code paragraph and signify awaiting feedback paragraph',
    function() {
      expect(
        SessionHistoryService.getBindableSessionTranscript().length
      ).toBe(0);
      expect(SessionHistoryService.isNewTranscriptParagraphPending()).toBe(
        false);

      SessionHistoryService.addCodeToTranscript('some code');

      expect(
        SessionHistoryService.getBindableSessionTranscript().length
      ).toBe(1);
      expect(SessionHistoryService.isNewTranscriptParagraphPending()).toBe(
        true);
    });

    it('should add a new feedback paragraph correctly', function() {
      var transcript = SessionHistoryService.getBindableSessionTranscript();
      expect(transcript.length).toBe(0);

      SessionHistoryService.addFeedbackToTranscript([
        FeedbackParagraphObjectFactory.fromDict({
          type: 'text',
          content: 'hello'
        })
      ]);
      $timeout.flush(DURATION_MSEC_WAIT_FOR_FEEDBACK);

      expect(transcript.length).toBe(1);
      var firstParagraph = transcript[0];
      expect(firstParagraph.isCodeSubmission()).toBe(false);
      var firstParagraphContent = firstParagraph.getFeedbackParagraphs();
      expect(firstParagraphContent.length).toBe(1);
      expect(firstParagraphContent[0].toDict()).toEqual({
        type: 'text',
        content: 'hello'
      });
    });

    it('should add a new feedback paragraph with a delay', function() {
      expect(
        SessionHistoryService.getBindableSessionTranscript().length
      ).toBe(0);
      expect(SessionHistoryService.isNewTranscriptParagraphPending()).toBe(
        false);

      SessionHistoryService.addCodeToTranscript('some code');

      expect(
        SessionHistoryService.getBindableSessionTranscript().length
      ).toBe(1);
      expect(SessionHistoryService.isNewTranscriptParagraphPending()).toBe(
        true);

      SessionHistoryService.addFeedbackToTranscript([
        FeedbackParagraphObjectFactory.fromDict({
          type: 'text',
          content: 'hello'
        })
      ]);
      expect(SessionHistoryService.isNewTranscriptParagraphPending()).toBe(
        true);
      expect(
        SessionHistoryService.getBindableSessionTranscript().length).toBe(1);

      $timeout.flush(DURATION_MSEC_WAIT_FOR_FEEDBACK);
      expect(
        SessionHistoryService.getBindableSessionTranscript().length
      ).toBe(2);
      expect(SessionHistoryService.isNewTranscriptParagraphPending()).toBe(
        false);
    });

    it('should reset the session transcript', function() {
      var transcript = SessionHistoryService.getBindableSessionTranscript();
      SessionHistoryService.addCodeToTranscript('some code');
      expect(transcript.length).toBe(1);

      SessionHistoryService.reset();
      expect(transcript.length).toBe(0);

      SessionHistoryService.addCodeToTranscript('some other code');
      expect(transcript[0].getFeedbackParagraphs()[0].toDict()).toEqual({
        type: 'code',
        content: 'some other code'
      });
    });

    it('should add a new submission confirmation paragraph correctly',
      function() {
        var transcript = SessionHistoryService.getBindableSessionTranscript();
        expect(transcript.length).toBe(0);

        SessionHistoryService.addSubmissionConfirmationToTranscript();
        expect(transcript.length).toBe(0);
        $timeout.flush(DURATION_MSEC_WAIT_FOR_SUBMISSION_CONFIRMATION);

        expect(transcript.length).toBe(1);
        var firstParagraph = transcript[0];
        expect(firstParagraph.isCodeSubmission()).toBe(false);
        var firstParagraphContent = firstParagraph.getFeedbackParagraphs();
        expect(firstParagraphContent.length).toBe(1);
        expect(firstParagraphContent[0].toDict()).toEqual({
          type: 'text',
          content: [
            'Your code has been submitted for grading. ',
            'Feel free to continue working on the exercise, ask for feedback ',
            'by clicking the "Get Feedback" button, or submit again with ',
            'the "Submit for Grading" button.'
          ].join('\n')
        });
      }
    );
  });
});
