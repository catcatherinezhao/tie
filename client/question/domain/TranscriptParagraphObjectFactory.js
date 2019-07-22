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
 * @fileoverview Object factory for the transcript paragraphs shown in the
 * conversation log.
 */

tie.factory('TranscriptParagraphObjectFactory', [
  'FeedbackParagraphObjectFactory', function(FeedbackParagraphObjectFactory) {

    // A paragraph representing code submitted by the user.
    var TRANSCRIPT_PARAGRAPH_TYPE_CODE = 'code';
    // A paragraph representing feedback given by TIE.
    var TRANSCRIPT_PARAGRAPH_TYPE_FEEDBACK = 'feedback';

    var ALLOWED_TRANSCRIPT_PARAGRAPH_TYPES = [
      TRANSCRIPT_PARAGRAPH_TYPE_CODE,
      TRANSCRIPT_PARAGRAPH_TYPE_FEEDBACK
    ];

    /**
     * Constructor for TranscriptParagraph.
     *
     * @param {string} type The type of the paragraph.
     * @param {Array<FeedbackParagraph>} feedbackParagraphs The contents of the
     *   paragraph, represented as FeedbackParagraph objects.
     * @constructor
     */
    var TranscriptParagraph = function(type, feedbackParagraphs) {
      /**
       * @type {string}
       * @private
       */
      this._type = type;

      /**
       * @type {Array}
       * @private
       */
      this._feedbackParagraphs = feedbackParagraphs;
    };

    // Instance methods.

    /**
     * A getter for the feedbackParagraphs list for this transcript paragraph.
     *
     * @returns {Array}
     */
    TranscriptParagraph.prototype.getFeedbackParagraphs = function() {
      return this._feedbackParagraphs;
    };

    /**
     * Returns whether the current paragraph is a code submission.
     *
     * @returns {boolean}
     */
    TranscriptParagraph.prototype.isCodeSubmission = function() {
      return this._type === TRANSCRIPT_PARAGRAPH_TYPE_CODE;
    };

    /**
     * Converts the current transcript paragraph to a raw JavaScript object.
     *
     * @returns {object} A JavaScript object representing the transcript
     * paragraph.
     */
    TranscriptParagraph.prototype.toDict = function() {
      return {
        type: (
          this.isCodeSubmission() ?
          TRANSCRIPT_PARAGRAPH_TYPE_CODE : TRANSCRIPT_PARAGRAPH_TYPE_FEEDBACK),
        feedbackParagraphContentDicts: this.getFeedbackParagraphs().map(
          function(feedbackParagraph) {
            return feedbackParagraph.toDict();
          }
        )
      };
    };

    // Static class methods.

    /**
     * Creates and returns a TranscriptParagraph object representing a feedback
     * paragraph.
     *
     * @param {Array<FeedbackParagraph>} feedbackParagraphs The contents of the
     *   paragraph, represented as FeedbackParagraph objects.
     * @returns {TranscriptParagraph}
     */
    TranscriptParagraph.createFeedbackParagraph = function(feedbackParagraphs) {
      return new TranscriptParagraph(
        TRANSCRIPT_PARAGRAPH_TYPE_FEEDBACK, feedbackParagraphs);
    };

    /**
     * Creates and returns a TranscriptParagraph object representing a code
     * paragraph.
     *
     * @param {string} submittedCode The code submitted by the learner.
     * @returns {TranscriptParagraph}
     */
    TranscriptParagraph.createCodeParagraph = function(submittedCode) {
      var codeParagraphs =
        [FeedbackParagraphObjectFactory.createCodeParagraph(submittedCode)];
      return new TranscriptParagraph(
        TRANSCRIPT_PARAGRAPH_TYPE_CODE, codeParagraphs);
    };

    /**
     * Creates a TranscriptParagraph object from a JavaScript object.
     *
     * @param {Object} transcriptParagraphDict A JavaScript object representing
     *  a transcript paragraph.
     * @returns {TranscriptParagraph}
     */
    TranscriptParagraph.fromDict = function(transcriptParagraphDict) {
      if (ALLOWED_TRANSCRIPT_PARAGRAPH_TYPES.indexOf(
        transcriptParagraphDict.type) === -1) {
        throw Error('Invalid transcript paragraph type: ' +
          transcriptParagraphDict.type);
      }

      return new TranscriptParagraph(
        transcriptParagraphDict.type,
        transcriptParagraphDict.feedbackParagraphContentDicts.map(
          function(feedbackParagraphDict) {
            return FeedbackParagraphObjectFactory.fromDict(
              feedbackParagraphDict);
          }
        )
      );
    };

    return TranscriptParagraph;
  }
]);
