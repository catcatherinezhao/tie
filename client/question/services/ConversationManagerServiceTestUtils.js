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
 * @fileoverview Test utilities for ConversationManagerService.
 */

tie.factory('ExpectedFeedbackObjectFactory', [function() {
  /**
   * Constructor for ExpectedFeedback, a domain object for representing the
   * expected feedback returned by the ConversationManagerService.
   *
   * @param {string|null} firstFeedbackParagraphContent
   * @param {string|null} secondFeedbackParagraphContent
   * @param {string=} stdout Assumed to be '' if not specified.
   * @param {boolean=} answerIsCorrect Assumed to be false if not specified.
   * @param {function=} validationFunc An optional function containing any
   *   additional validation checks that need to happen.
   * @constructor
   */
  var ExpectedFeedback = function(
      firstFeedbackParagraphContent, secondFeedbackParagraphContent, stdout,
      answerIsCorrect, validationFunc) {
    /**
     * @type {string|null}
     * @private
     */
    this._firstFeedbackParagraphContent = firstFeedbackParagraphContent;

    /**
     * @type {string|null}
     * @private
     */
    this._secondFeedbackParagraphContent = (
      secondFeedbackParagraphContent === undefined ? null :
      secondFeedbackParagraphContent);

    /**
     * @type {string}
     * @private
     */
    this._stdout = (stdout === undefined ? '' : stdout);

    /**
     * @type {boolean}
     * @private
     */
    this._answerIsCorrect = answerIsCorrect || false;

    /**
     * @type {function|null}
     * @private
     */
    this._validationFunc = validationFunc || null;
  };

  // Instance methods.

  /**
   * Returns a list of errors encountered when verifying the feedback against
   * the expected conditions.
   *
   * @param {LearnerViewSubmissionResult} submissionResult The result received
   *   from ConversationManagerService to display in the learner view.
   *
   * @returns {Array<string>} The list of differences between the observed and
   *   expected submission results.
   */
  ExpectedFeedback.prototype.verifyFeedback = function(submissionResult) {
    var errorMessages = [];

    var feedback = submissionResult.getFeedback();

    if (this._firstFeedbackParagraphContent !== null) {
      var observedContent = feedback.getParagraphs()[0].getContent();
      var expectedContent = this._firstFeedbackParagraphContent;
      if (observedContent !== expectedContent) {
        errorMessages.push(
          'Bad content for first feedback paragraph: expected "' +
          expectedContent + '" but received "' + observedContent + '"');
      }
    }

    if (this._secondFeedbackParagraphContent !== null) {
      observedContent = feedback.getParagraphs()[1].getContent();
      expectedContent = this._secondFeedbackParagraphContent;
      if (observedContent !== expectedContent) {
        errorMessages.push(
          'Bad content for second feedback paragraph: expected "' +
          expectedContent + '" but received "' + observedContent + '"');
      }
    }

    var observedStdout = submissionResult.getStdout();
    var expectedStdout = this._stdout;
    if (observedStdout !== expectedStdout) {
      errorMessages.push(
        'Bad stdout: expected "' + expectedStdout + '" but received "' +
        observedStdout + '"');
    }

    if (feedback.isAnswerCorrect() !== this._answerIsCorrect) {
      errorMessages.push(
        'Error: expected answer to be "' + this._answerIsCorrect + '" but ' +
        'observed the opposite');
    }

    if (this._validationFunc !== null) {
      errorMessages = errorMessages.concat(
        this._validationFunc(submissionResult));
    }

    return errorMessages;
  };

  // Static class methods.

  /**
   * Creates and returns an ExpectedFeedback object.
   *
   * @param {string|null} firstFeedbackParagraphContent The expected content of
   *   the first feedback paragraph, or null if we do not need to check this.
   * @param {string|null} secondFeedbackParagraphContent The expected content
   *   of the second feedback paragraph, or null if we do not need to check
   *   this.
   * @param {string=} stdout The expected stdout returned by
   *   ConversationManagerService. Assumed to be '' if not specified
   *   explicitly.
   * @param {boolean=} answerIsCorrect Whether the learner's answer is deemed
   *   correct. Assumed to be false if not specified explicitly.
   * @param {function=} validationFunc An optional function containing any
   *   additional validation checks that need to happen.
   * @returns {ExpectedFeedback}
   */
  ExpectedFeedback.create = function(
      firstFeedbackParagraphContent, secondFeedbackParagraphContent, stdout,
      answerIsCorrect, validationFunc) {
    return new ExpectedFeedback(
      firstFeedbackParagraphContent, secondFeedbackParagraphContent, stdout,
      answerIsCorrect, validationFunc);
  };

  return ExpectedFeedback;
}]);
