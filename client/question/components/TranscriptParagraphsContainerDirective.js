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
      <div>
        <div class="tie-dot-container" ng-class="{'tie-display-dots': sessionTranscript.length > 0 && sessionTranscript[0].isCodeSubmission()}"}>
          <div class="tie-dot tie-dot-1"></div>
          <div class="tie-dot tie-dot-2"></div>
          <div class="tie-dot tie-dot-3"></div>
        </div>
        <div class="tie-feedback-container" ng-repeat="paragraph in sessionTranscript" aria-live="assertive">
          <tie-feedback-content-container>
            <div>
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
            </div>
          </tie-feedback-content-container>
        </div>
      </div>

      <style>
        @-webkit-keyframes tie-dot {
          from { -webkit-transform: translate(0px, 0px); }
          10%  { -webkit-transform: translate(0px, -10px); }
          20%  { -webkit-transform: translate(0px, 0px); }
          to   { -webkit-transform: translate(0px, 0px); }
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
          margin-bottom: 10px;
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
        .tie-feedback-container {
          border-top: 1px solid #ddd;
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
        .tie-feedback-content-container {
          clear: right;
          display: block;
          overflow: auto;
          transition: margin-top 0.2s cubic-bezier(0.4, 0.0, 0.2, 1),
                      opacity 0.15s cubic-bezier(0.4, 0.0, 0.2, 1) 0.2s;
        }
      </style>
    `,
    controller: [
      '$scope', 'SessionHistoryService',
      function($scope, SessionHistoryService) {
        $scope.sessionTranscript = (
          SessionHistoryService.getBindableSessionTranscript());
      }
    ]
  };
}]);

