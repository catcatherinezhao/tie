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
 * @fileoverview Directive for the transcript paragraph container.
 */

tie.directive('transcriptParagraphsContainer', [function() {
  return {
    restrict: 'E',
    scope: {},
    template: `
      <div class="tie-transcript-paragraphs-container">
        <div class="tie-dot-container" 
          ng-class="{'tie-display-dots': sessionTranscript.length > 0 && sessionTranscript[0].isCodeSubmission()}"
          ng-if="sessionTranscript.length > 0 && sessionTranscript[0].isCodeSubmission()"}>
          <div class="tie-dot tie-dot-1"></div>
          <div class="tie-dot tie-dot-2"></div>
          <div class="tie-dot tie-dot-3"></div>
        </div>
        <div class="tie-arrow-button-container" 
          ng-if="!sessionTranscript[0].isCodeSubmission()">
          <button class="tie-arrow-button protractor-test-up-button"
            ng-click="onUpButtonPress()"
            ng-disabled="upButtonIsDisabled">
            &#9650;
          </button>
        </div>
        <p class="tie-feedback-title" ng-if="!sessionTranscript[0].isCodeSubmission()">Snapshot {{currentSnapshotIndex}}</p>
        <div class="tie-feedback-container" ng-repeat="paragraph in sessionTranscript track by $index" aria-live="assertive">
          <tie-feedback-content-container ng-if="currentFeedbackIndex == $index">
            <p ng-repeat="paragraph in paragraph.getFeedbackParagraphs() track by $index" class="tie-feedback-paragraph protractor-test-feedback-paragraph" ng-class="{'tie-feedback-paragraph-code': paragraph.isCodeParagraph()}">
              <span ng-if="paragraph.isTextParagraph()">
                <html-with-markdown-links-snippet content="paragraph.getContent()">
                </html-with-markdown-links-snippet>
              </span>
              <span ng-if="paragraph.isErrorParagraph()">
                <error-snippet content="paragraph.getContent()">
                </error-snippet>
              </span>
              <span ng-if="paragraph.isOutputParagraph()">
                <output-snippet content="paragraph.getContent()">
                </output-snippet>
              </span>
              <span ng-if="paragraph.isImageParagraph()">
                <img class="tie-question-completion-image" ng-src="../assets/images/{{paragraph.getContent()}}">
              </span>
            </p>
          </tie-feedback-content-container>
        </div>
        <div class="tie-arrow-button-container" 
          ng-if="!sessionTranscript[0].isCodeSubmission()">
          <button class="tie-arrow-button protractor-test-down-button"
            ng-click="onDownButtonPress()"
            ng-disabled="downButtonIsDisabled">
            &#9660;
          </button>
        </div>
      </div>

      <style>
        @-webkit-keyframes tie-dot {
          from { -webkit-transform: translate(0px, 0px); }
          10%  { -webkit-transform: translate(0px, -10px); }
          20%  { -webkit-transform: translate(0px, 0px); }
          to   { -webkit-transform: translate(0px, 0px); }
        }
        .tie-arrow-button-container {
          display: flex;
          justify-content: center;
          padding: 10px;
        }
        .tie-arrow-button {
          border: none;
          background-color: transparent;
          cursor: pointer;
          color: #707070;
        }
        .tie-arrow-button:hover:enabled {
          color: #000000;
        }
        .tie-arrow-button:active:enabled {
          color: #000000;
        }
        .tie-arrow-button[disabled] {
          color: #d8d8d8;
        }
        .tie-dot {
          -webkit-animation-name: tie-dot;
          -webkit-animation-duration: 1.2s;
          -webkit-animation-iteration-count: infinite;
          background-color: black;
          border-radius: 2px;
          float: left;
          height: 4px;
          margin-right: 7px;
          margin-top: 3px;
          width: 4px;
        }
        .tie-dot-container {
          display: inline-block;
          height: 10px;
          opacity: 0;
          padding-left: 5px;
          transition-delay: 0.2s;
        }
        .tie-dot-2 {
          -webkit-animation-delay: 0.1s;
        }
        .tie-dot-3 {
          -webkit-animation-delay: 0.2s;
        }
        .tie-display-dots {
          opacity: 1;
        }
        .tie-feedback-paragraph {
          width: 100%;
        }
        .tie-feedback-paragraph-code {
          font-size: 12px;
          padding-right: 8px;
          width: 95%;
        }
        .tie-question-completion-image {
          height: 180px;
        }
        .tie-feedback-container {
          width: 100%;
          height: 100%;
        }
        .tie-feedback-content-container {
          clear: right;
          display: block;
          overflow: auto;
          transition: margin-top 0.2s cubic-bezier(0.4, 0.0, 0.2, 1),
                      opacity 0.15s cubic-bezier(0.4, 0.0, 0.2, 1) 0.2s;
        }
        .tie-feedback-title {
          text-align: center;
          font-weight: bold;
        }
        .tie-transcript-paragraphs-container {
          padding: 5% 10% 5% 10%;
        }
      </style>
    `,
    controller: [
      '$scope', 'SessionHistoryService',
      function($scope, SessionHistoryService) {
        /**
         * Sets a variable to the session transcript.
         */
        $scope.sessionTranscript = (
          SessionHistoryService.getBindableSessionTranscript());

        /**
         * Sets a variable to the number of feedback paragraphs.
         */
        $scope.numFeedbackParagraphs = 0;

        /**
         * Sets a variable to the index of the current feedback displayed
         * in the feedback window.
         */
        $scope.currentFeedbackIndex = 0;

        /**
         * Sets a variable to the current snapshot index.
         */
        $scope.currentSnapshotIndex = $scope.sessionTranscript[
          $scope.currentFeedbackIndex].getSnapshotIndex();

        /**
         * Defines whether the up button is disabled.
         */
        $scope.upButtonIsDisabled = true;

        /**
         * Defines whether the down button is disabled.
         */
        $scope.downButtonIsDisabled = true;

        /**
         * Counts the number of feedback paragraphs in the session transcript.
         */
        $scope.countNumFeedbackParagraphs = function() {
          var numFeedbackParagraphs = 0;
          for (var i = 0; i < $scope.sessionTranscript.length; i++) {
            if (!$scope.sessionTranscript[i].isCodeSubmission()) {
              numFeedbackParagraphs++;
            }
          }
          return numFeedbackParagraphs;
        };

        /**
         * Checks whether the up and down buttons should be enabled or disabled,
         * and enables or disables the buttons.
         */
        $scope.checkButtonEnabledOrDisabled = function() {
          // When there are no more previous feedback to go back to in the
          // session transcript, disable the up button.
          if ($scope.numFeedbackParagraphs > 1 &&
            $scope.currentFeedbackIndex < $scope.numFeedbackParagraphs) {
            $scope.upButtonIsDisabled = false;
          } else {
            $scope.upButtonIsDisabled = true;
          }
          // When there are no more feedback to go forward to in the
          // session transcript, disable the down button.
          if ($scope.currentFeedbackIndex === 0) {
            $scope.downButtonIsDisabled = true;
          } else {
            $scope.downButtonIsDisabled = false;
          }
        };

        /**
         * Changes the feedback index to be displayed to the index of the
         * previous feedback displayed when the up arrow is pressed.
         */
        $scope.onUpButtonPress = function() {
          if ($scope.currentFeedbackIndex < $scope.numFeedbackParagraphs) {
            // The most recent feedback is appended to the front of the session
            // transcript, so to go back to the previous feedback paragraph the
            // index is increased.
            // The index is increased in increments of 2 because every other
            // paragraph in the session transcript is a feedback paragraph.
            $scope.currentFeedbackIndex += 2;
          } else {
            throw Error('Current feedback index is out of range.');
          }
          $scope.currentSnapshotIndex = $scope.sessionTranscript[
            $scope.currentFeedbackIndex].getSnapshotIndex();
          $scope.checkButtonEnabledOrDisabled();
        };

        /**
         * Changes the feedback index to be displayed to the index of the next
         * feedback displayed when the down arrow is pressed.
         */
        $scope.onDownButtonPress = function() {
          if ($scope.currentFeedbackIndex - 2 >= 0) {
            // The most recent feedback is appended to the front of the session
            // transcript, so to go forward to the next feedback paragraph the
            // index is increased.
            // The index is decreased in decrements of 2 because every other
            // paragraph in the session transcript is a feedback paragraph.
            $scope.currentFeedbackIndex -= 2;
          } else {
            throw Error('Current feedback index is out of range.');
          }
          $scope.currentSnapshotIndex = $scope.sessionTranscript[
            $scope.currentFeedbackIndex].getSnapshotIndex();
          $scope.checkButtonEnabledOrDisabled();
        };

        /**
         * Sets the current feedback index to be displayed to the feedback
         * corresponding to the most recent code submission when the feedback
         * changes.
         */
        $scope.$watch('sessionTranscript.length', function() {
          // Display the most recent feedback in the feedback window.
          $scope.currentFeedbackIndex = 0;
          $scope.currentSnapshotIndex = $scope.sessionTranscript[
            $scope.currentFeedbackIndex].getSnapshotIndex();
          $scope.numFeedbackParagraphs = $scope.countNumFeedbackParagraphs();
          $scope.checkButtonEnabledOrDisabled();
        });
      }
    ]
  };
}]);
