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
 * @fileoverview Directive for the learner "practice question" view.
 */

tie.directive('learnerView', [function() {
  return {
    restrict: 'E',
    scope: {},
    template: `
      <div class="tie-wrapper protractor-test-tie-wrapper">
        <div class="tie-question-ui-outer">
          <div class="tie-question-ui-inner">
            <monospace-display-modal
                ng-show="MonospaceDisplayModalService.isDisplayed()"
                content="content">
            </monospace-display-modal>
            <div class="tie-question-ui protractor-test-question-ui">
              <div class="tie-question-window">
                <div class="tie-question-container" ng-class="{'pulse-animation-enabled': pulseAnimationEnabled}" ng-attr-aria-hidden="{{MonospaceDisplayModalService.isDisplayed()}}">
                  <h1 class="tie-question-title">{{title}}</h1>
                  <div class="tie-previous-instructions" ng-if="!pageIsIframed">
                    <div ng-repeat="previousInstruction in previousInstructions track by $index">
                      <div ng-repeat="instruction in previousInstruction track by $index">
                        <p ng-if="instruction.type == 'text'">
                          {{instruction.content}}
                        </p>
                        <pre class="tie-question-code" ng-if="instruction.type == 'code'">{{instruction.content}}</pre>
                      </div>
                      <hr>
                    </div>
                  </div>
                  <div class="tie-instructions" ng-if="!pageIsIframed">
                    <div ng-repeat="instruction in instructions">
                      <p ng-if="instruction.type == 'text'">
                        {{instruction.content}}
                      </p>
                      <pre class="tie-question-code" ng-if="instruction.type == 'code'">{{instruction.content}}</pre>
                    </div>
                  </div>
                  <speech-balloons-container></speech-balloons-container>
                </div>
              </div>
            </div>
            <div class="tie-coding-ui protractor-test-coding-ui">
              <div class="tie-lang-terminal">
                <div class="tie-user-terminal" ng-class="{'print-mode': printingIsSupported}">
                  <div class="tie-coding-terminal">
                    <div class="tie-codemirror-container"
                        tabindex="0"
                        ng-keypress="onKeypressCodemirrorContainer($event)"
                        ng-focus="onFocusCodemirrorContainer()">
                      <ui-codemirror ui-codemirror-opts="codeMirrorOptions"
                          ng-model="editorContents.code"
                          ng-change="onCodeChange()"
                          ng-if="!accessibleMode"
                          class="protractor-test-code-input-element">
                      </ui-codemirror>
                      <ui-codemirror ng-model="editorContents.code"
                          ui-codemirror-opts="accessibleCodeMirrorOptions"
                          ng-change="onCodeChange()"
                          ng-if="accessibleMode"
                          class="protractor-test-code-input-element">
                      </ui-codemirror>
                    </div>
                  </div>
                </div>
                <div class="tie-code-auto-save"
                    ng-show="autosaveTextIsDisplayed">
                  Saving code...
                </div>
                <button class="tie-submit-button tie-button tie-button-green protractor-test-submit-code-button" ng-if="pageIsIframed" ng-click="submitToParentPage(editorContents.code)" title="Click anytime you want to submit your code">
                  Submit for Grading
                </button>
                <button class="tie-run-button tie-button protractor-test-run-code-button" ng-class="{'tie-button-green': !pageIsIframed}" ng-click="submitCode(editorContents.code)" ng-disabled="SessionHistoryService.isNewBalloonPending()" title="Click anytime you want feedback on your code">
                  RUN
                </button>
                <div>
                  <select class="tie-select-menu protractor-test-submission-select"
                      ng-change="changeSubmission(currentSubmissionNumber)"
                      ng-model="currentSubmissionNumber"
                      ng-options="i.number as i.title for i in totalSubmissions"
                      ng-disabled="totalSubmissions.length === 0"
                      title="Click to see your previous submissions">
                      <option value="" disabled>PREVIOUS</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="tie-output-ui protractor-test-coding-ui">
              <div class="tie-lang-terminal">
                <div class="tie-user-terminal" ng-class="{'print-mode': printingIsSupported}">
                  <div class="tie-print-terminal" ng-if="printingIsSupported">
                    <h1 class="tie-print-title"> Printed Output </h1>
                    <div class="tie-stdout">{{stdout}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="tie-options-row">
            <ul>
              <li class="tie-footer-left-aligned-link" ng-if="TERMS_OF_USE_URL">
                <a target="_blank" ng-href="{{TERMS_OF_USE_URL}}">Terms of Use</a>
              </li>
              <li class="tie-footer-left-aligned-link" ng-click="onPrivacyClick()">
                <a href="#" class="protractor-test-privacy-link">Privacy</a>
              </li>
              <li class="tie-footer-right-aligned-link">
                <a target="_blank" class="protractor-test-about-link" ng-href="{{ABOUT_TIE_URL}}">{{ABOUT_TIE_LABEL}}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div aria-live="assertive">
        <div role="alert" ng-if="ariaLiveMessage.text">{{ariaLiveMessage.text}}</div>
      </div>

      <style>
        div.CodeMirror span.CodeMirror-matchingbracket {
          color: rgb(75, 206, 75);
        }
        .tie-arrow-highlighter {
          background-color: white;
          border-radius: 100px;
          box-shadow: 0px 0px 42px 67px white;
          height: 50px;
          left: calc(50% - 25px);
          position: absolute;
          top: calc(50% - 25px);
          width: 50px;
        }
        .tie-button {
          background-color: #ffffff;
          border-radius: 4px;
          border-style: none;
          color: black;
          cursor: pointer;
          display: block;
          font-family: Roboto, 'Helvetica Neue', 'Lucida Grande', sans-serif;
          font-size: 12px;
          height: 30px;
          margin-right: 10px;
          outline: none;
          padding: 1px 6px;
          width: 110px;
        }
        .tie-button:hover {
          border: 1px solid #e4e4e4;
        }
        .tie-button:active {
          border-color: #a0a0a0;
        }
        .tie-button-blue {
          background-color: #448AFF;
          border: none;
          color: #ffffff;
          outline: none;
        }
        .tie-button-blue:hover {
          background-color: #2979FF;
        }
        .tie-button-blue:active {
          background-color: #2962FF;
        }
        .tie-button-red {
          background-color: #d8d8d8;
          border: none;
          color: #000000;
          outline: none;
        }
        .tie-button-red:hover {
          background-color: #bdbdbd;
        }
        .tie-button-red:active {
          background-color: #b0b0b0;
        }
        .tie-button-green {
          background-color: #a2d6a4;
          border: none;
          outline: none;
        }
        .tie-button-green:hover {
          border-color: #669e68;
        }
        .tie-button-green:active {
          background-color: #669e68;
        }
        .tie-button-green[disabled] {
          opacity: 0.4;
        }
        .tie-button-green[disabled]:hover {
          border: none;
        }
        .tie-button-gray {
          background-color: #a7a7a7;
          border: none;
          outline: none;
        }
        .tie-button-gray:hover {
          border-color: #777777;
        }
        .tie-button-gray:active {
          background-color: #777777;
        }
        .tie-button-gray[disabled] {
          opacity: 0.4;
        }
        .tie-button-gray[disabled]:hover {
          border: none;
        }
        .tie-code-auto-save {
          font-family: Roboto, 'Helvetica Neue', 'Lucida Grande', sans-serif;
          font-size: 13px;
          float: left;
          margin-top: 14px;
          margin-left: 0;
        }
        .tie-coding-terminal .CodeMirror {
          /* Overwriting codemirror defaults */
          height: 100%;
        }
        .tie-codemirror-container {
          width: 100%;
        }
        .tie-coding-terminal {
          background-color: rgb(255, 255, 255);
          display: flex;
          font-size: 13px;
          height: 100%;
          position: relative;
          width: 100%;
          -webkit-font-smoothing: antialiased;
        }
        .print-mode .tie-coding-terminal {
          display: flex;
          font-size: 13px;
          height: 228px;
          position: relative;
          width: 100%;
        }
        .tie-coding-window {
          display: flex;
        }
        .tie-coding-terminal:focus, .tie-run-button:focus,
            .tie-select-menu:focus {
          outline: 0;
        }
        .tie-coding-ui, .tie-question-ui, .tie-output-ui {
          display: inline-block;
          margin: 8px;
          white-space: normal;
        }
        .tie-output-ui { 
          width: 25%;
        }
        .tie-coding-ui {
          width: 50%;
        }
        .tie-feedback-error-string {
          color: #F44336;
        }
        .tie-feedback-window {
          background-color: rgb(255, 255, 242);
          font-size: 14px;
          height: 128px;
          overflow: auto;
          padding: 10px;
          resize: both;
          width: 642px;
          -webkit-font-smoothing: antialiased;
        }
        .tie-footer-left-aligned-link {
          float: left;
        }
        .tie-footer-right-aligned-link {
          float: right;
        }
        .tie-lang-select-menu {
          float: left;
          margin-top: 10px;
        }
        .tie-lang-terminal {
          display: inline;
        }
        .tie-options-row {
          padding-left: 32px;
          padding-right: 32px;
        }
        .tie-options-row a {
          color: #696969;
          display: block;
          line-height: 25px;
          padding: 5px;
          text-decoration: none;
        }
        .tie-options-row li {
          margin: 5px;
        }
        .tie-options-row ul {
          font-size: 11px;
          list-style-type: none;
          margin: 0;
          padding: 0;
        }
        .tie-options-row a:hover {
          text-decoration: underline;
        }
        .tie-previous-instructions {
          opacity: 0.5;
        }
        .tie-print-title {
          font-size: 18px;
          padding-top: 3px;
          text-align: center;
        }
        .tie-print-terminal {
          background-color: #ffffff;
          height: 228px;
          overflow: auto;
          width: 100%;
        }
        .tie-question-code {
          background: rgb(242, 242, 242);
          border: 1px solid #ccc;
          font-family: monospace;
          font-size: 13px;
          padding: 10px;
          white-space: -moz-pre-wrap;
          white-space: -o-pre-wrap;
          white-space: -pre-wrap;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .tie-question-container {
          padding: 10px;
        }
        .tie-question-title {
          color: #212121;
          font-size: 18px;
        }
        .tie-question-ui {
          width: 25%;
          vertical-align: top;
        }
        .tie-question-ui-inner {
          display: flex;
          padding-left: 32px;
          padding-right: 32px;
          white-space: nowrap;
          max-width: 1170px;
        }
        .tie-question-ui-outer {
          margin-left: auto;
          margin-right: auto;
          max-width: 1170px;
          min-width: 1058px;
          padding-top: 30px;
        }
        .tie-question-window {
          background-color: #FFFFF7;
          font-size: 14px;
          height: 228px;
          width: 100%;
          max-width: 700px;
          overflow: auto;
          padding: 0;
        }
        .tie-monospace-modal-container {
          border: 1px solid #d3d3d3;
          resize: none;
        }
        .tie-run-button, .tie-step-button {
          float: right;
          margin-right: 0;
          margin-top: 10px;
          position: relative;
        }
        .tie-step-button {
          margin-right: 5px;
        }
        .tie-select-menu {
          background-color: #ffffff;
          border: 1px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          float: right;
          height: 30px;
          margin-right: 5px;
          margin-top: 10px;
          min-width: 100px;
          padding: 1px 6px;
        }
        .tie-select-menu:hover {
          border-color: #e4e4e4;
        }
        .tie-stdout {
          font-family: monospace;
          font-size: 13px;
          line-height: 1.2em;
          padding-bottom: 12px;
          padding-left: 5%;
          padding-right: 5%;
          white-space: pre-wrap;
        }
        .tie-submit-button {
          float: right;
          margin-left: 7px;
          margin-right: 0;
          margin-top: 10px;
          position: relative;
          width: 122px;
        }
        .tie-user-terminal {
          height: 228px;
          display: flex;
        }
        .CodeMirror-linenumber {
          /* Increase the contrast of the line numbers from the background. */
          color: #424242;
        }
        .CodeMirror-line.tie-syntax-error-line {
          background: #FBC2C4;
        }
        .tie-wrapper {
          height: 100%;
        }
        @media screen and (max-width: 1058px) {
          .tie-options-row {
            padding-left: 0;
            padding-right: 0;
          }
          .tie-question-ui-inner {
            display: flex;
            flex-direction: column;
            padding-left: 0;
            padding-right: 0;
            white-space: nowrap;
            width: 677px;
          }
          .tie-question-ui-outer {
            margin-left: auto;
            margin-right: auto;
            min-width: 691px;
            padding-top: 30px;
            width: 662px;
          }
          .tie-question-window {
            background-color: #FFFFF7;
            font-size: 14px;
            height: 528px;
            min-height: 300px;
            overflow: auto;
            padding: 0;
            width: 662px;
          }
          .tie-coding-ui, .tie-question-ui, .tie-output-ui {
            width: 662px;
          }
          .tie-question-ui-inner .tie-monospace-modal-container {
            width: 662px;
          }
        }
      </style>
    `,
    controller: [
      '$scope', '$interval', '$timeout', '$location', '$window',
      'ConversationManagerService', 'QuestionDataService', 'LANGUAGE_PYTHON',
      'FeedbackObjectFactory', 'LearnerViewSubmissionResultObjectFactory',
      'EventHandlerService', 'LocalStorageService',
      'ServerHandlerService', 'SessionIdService', 'ThemeNameService',
      'UnpromptedFeedbackManagerService', 'MonospaceDisplayModalService',
      'CurrentQuestionService', 'PrintTerminalService',
      'ParentPageService', 'ALL_SUPPORTED_LANGUAGES',
      'SUPPORTED_LANGUAGE_LABELS', 'SessionHistoryService', 'AutosaveService',
      'SECONDS_TO_MILLISECONDS', 'CODE_CHANGE_DEBOUNCE_SECONDS',
      'DISPLAY_AUTOSAVE_TEXT_SECONDS', 'SERVER_URL', 'DEFAULT_QUESTION_ID',
      'FEEDBACK_CATEGORIES', 'DEFAULT_EVENT_BATCH_PERIOD_SECONDS',
      'DELAY_STYLE_CHANGES', 'CODE_RESET_CONFIRMATION_MESSAGE', 'PRIVACY_URL',
      'ABOUT_TIE_URL', 'ABOUT_TIE_LABEL', 'TERMS_OF_USE_URL',
      function(
          $scope, $interval, $timeout, $location, $window,
          ConversationManagerService, QuestionDataService, LANGUAGE_PYTHON,
          FeedbackObjectFactory, LearnerViewSubmissionResultObjectFactory,
          EventHandlerService, LocalStorageService,
          ServerHandlerService, SessionIdService, ThemeNameService,
          UnpromptedFeedbackManagerService, MonospaceDisplayModalService,
          CurrentQuestionService, PrintTerminalService,
          ParentPageService, ALL_SUPPORTED_LANGUAGES,
          SUPPORTED_LANGUAGE_LABELS, SessionHistoryService, AutosaveService,
          SECONDS_TO_MILLISECONDS, CODE_CHANGE_DEBOUNCE_SECONDS,
          DISPLAY_AUTOSAVE_TEXT_SECONDS, SERVER_URL, DEFAULT_QUESTION_ID,
          FEEDBACK_CATEGORIES, DEFAULT_EVENT_BATCH_PERIOD_SECONDS,
          DELAY_STYLE_CHANGES, CODE_RESET_CONFIRMATION_MESSAGE, PRIVACY_URL,
          ABOUT_TIE_URL, ABOUT_TIE_LABEL, TERMS_OF_USE_URL) {
        $scope.PRIVACY_URL = PRIVACY_URL;
        $scope.ABOUT_TIE_URL = ABOUT_TIE_URL;
        $scope.ABOUT_TIE_LABEL = ABOUT_TIE_LABEL;
        $scope.TERMS_OF_USE_URL = TERMS_OF_USE_URL;

        $scope.SessionHistoryService = SessionHistoryService;
        $scope.MonospaceDisplayModalService = MonospaceDisplayModalService;

        var KEY_CODE_ENTER = 13;

        var ARIA_LIVE_MESSAGE_RANDOM_ID_RANGE = 10000;
        var ARIA_LIVE_MESSAGE_TIMEOUT_MILLISECONDS = 2000;
        var ARIA_LIVE_MESSAGE_CODEMIRROR_CONTAINER_FOCUSED = (
          'Press Enter to access the code editor.');
        var ARIA_LIVE_MESSAGE_CODEMIRROR_ENTERED = (
          'Press Escape to exit the code editor.');

        /**
         * Name of the class for styling highlighted syntax errors.
         *
         * @type {string}
         * @constant
         */
        var CSS_CLASS_SYNTAX_ERROR = 'tie-syntax-error-line';

        /**
         * Sets a local variable language to the value of the constant
         * LANGUAGE_PYTHON.
         *
         * @type {string}
         */
        var language = LANGUAGE_PYTHON;

        /**
         * A dictionary of labels, keyed by their supported language
         */
        $scope.supportedLanguageLabels = SUPPORTED_LANGUAGE_LABELS;
        $scope.supportedLanguageCount = Object.keys(
          SUPPORTED_LANGUAGE_LABELS).length;

        /**
         * Sets a local variable currentSubmission to the current
         * submission object for display in the editor.
         *
         * @type {number}
         */
        $scope.currentSubmissionNumber = 0;

        /**
         * Defines the total number of submissions in the editor.
         *
         * @type {Array}
         */
        $scope.totalSubmissions = [];

        /**
         * Defines whether printing is supported, and thus whether the print
         * terminal should be displayed.
         */
        $scope.printingIsSupported = PrintTerminalService.isPrintingSupported();

        /**
         * Defines whether TIE is currently being framed by the expected
         * parent origin. If it is, the "Submit Code" button should be
         * displayed.
         */
        $scope.pageIsIframed = ParentPageService.isIframed();

        /**
         * The ARIA alert message to show temporarily, as well as a random
         * integer generated to uniquely identify when it was first shown. When
         * the time comes for the message to be removed, the random identifier
         * is used to verify first that the removed message matches the
         * originally-added one.
         *
         * @type {string}
         */
        $scope.ariaLiveMessage = {
          text: '',
          randomIdentifier: -1
        };

        /**
         * We use an object here to prevent the child scope introduced by ng-if
         * from shadowing the parent scope.
         *
         * See http://stackoverflow.com/a/21512751
         * .
         * @type {{code: string}}
         */
        $scope.editorContents = {
          code: ''
        };

        // Whether to show the more accessible version of the CodeMirror
        // editor. "Accessible mode" is triggered by the user tabbing to the
        // editor.
        $scope.accessibleMode = false;

        /**
         * Stores a promise for the $interval process that automatically
         * retriggers the codeChangeEvent, so that that process can be
         * cancelled later.
         *
         * @type {Promise|null}
         */
        $scope.codeChangeLoopPromise = null;

        /**
         * String to store the code being cached within this directive
         * controller (this code may not have been submitted yet). This is used
         * to detect a local code change so that we can show appropriate
         * feedback if the learner is going down a rabbit-hole.
         *
         * @type {string}
         */
        var cachedCode;

        /**
         * Stores the feedback to be shown when the user completes a question.
         *
         * @type {Feedback}
         */
        var congratulatoryFeedback = FeedbackObjectFactory.create(
          FEEDBACK_CATEGORIES.SUCCESSFUL, true);

        /**
         * Stores the index of the task that the user is currently trying to
         * complete.
         *
         * @type {number}
         */
        var currentTaskIndex = null;

        /**
         * Stores the `div` node from the DOM where the question instructions
         * and feedback will be rendered.
         *
         * @type {DOM}
         */
        var questionWindowDiv =
            document.getElementsByClassName('tie-question-window')[0];

        /**
         * Shows an aria-live message alert for 2 seconds.
         *
         * @param {string} message The message to show.
         */
        var showAriaLiveMessage = function(messageText) {
          var randomInt = Math.random(ARIA_LIVE_MESSAGE_RANDOM_ID_RANGE);
          $scope.ariaLiveMessage.text = messageText;
          $scope.ariaLiveMessage.randomIdentifier = randomInt;
          $timeout(function() {
            if ($scope.ariaLiveMessage.randomIdentifier === randomInt) {
              $scope.ariaLiveMessage.text = '';
              $scope.ariaLiveMessage.randomIdentifier = -1;
            }
          }, ARIA_LIVE_MESSAGE_TIMEOUT_MILLISECONDS);
        };

        $scope.onVisibilityChange = function() {
          var question = CurrentQuestionService.getCurrentQuestion();
          // If the question is null (such as if there's an error getting it)
          // then we 404 on a server version. If that happens, this throws a
          // mysterious console error since we call null.getTasks(), which is
          // bad. This prevents that error.
          if (question) {
            var tasks = question.getTasks();

            // When a user changes tabs (or comes back), add a SessionPause
            // or SessionResumeEvent, respectively.
            var hiddenAttributeName = (
              $scope.determineHiddenAttributeNameForBrowser());
            if (hiddenAttributeName !== null && tasks !== null &&
                tasks.length > currentTaskIndex) {
              if ($scope.isDocumentHidden(hiddenAttributeName)) {
                EventHandlerService.createSessionPauseEvent(
                  tasks[currentTaskIndex].getId());
              } else {
                EventHandlerService.createSessionResumeEvent(
                  tasks[currentTaskIndex].getId());
              }
            }
          }
        };

        // Move document[hiddenAttributeName] getter into function for testing.
        $scope.isDocumentHidden = function(hiddenAttributeName) {
          return document[hiddenAttributeName];
        };

        // Move document.hidden getter into function for testing.
        $scope.getHiddenAttribute = function() {
          return document.hidden;
        };

        // Move document.msHidden getter into function for testing.
        $scope.getMsHiddenAttribute = function() {
          return document.msHidden;
        };

        // Move document.webkitHidden getter into function for testing.
        $scope.getWebkitHiddenAttribute = function() {
          return document.webkitHidden;
        };

        /**
         * Different browsers call the "hidden" attribute different things.
         * This method determines what the current browser calls its "hidden"
         * attribute and returns it.
         */
        $scope.determineHiddenAttributeNameForBrowser = function() {
          if (typeof $scope.getHiddenAttribute() !== 'undefined') {
            // Opera 12.10 and Firefox 18 and later support
            return 'hidden';
          } else if (typeof $scope.getMsHiddenAttribute() !== 'undefined') {
            return 'msHidden';
          } else if (typeof $scope.getWebkitHiddenAttribute() !== 'undefined') {
            return 'webkitHidden';
          }
          return null;
        };

        $scope.determineVisibilityChangeAttributeNameForBrowser = function() {
          // Handle page visibility change
          if (typeof $scope.getHiddenAttribute() !== 'undefined') {
            // Opera 12.10 and Firefox 18 and later support
            return 'visibilitychange';
          } else if (typeof $scope.getMsHiddenAttribute() !== 'undefined') {
            return 'msvisibilitychange';
          } else if (
            typeof $scope.getWebkitHiddenAttribute() !== 'undefined') {
            return 'webkitvisibilitychange';
          }
          // This should never happen, as hiddenAttributeName relies on the same
          // criteria to be non-null.
          return null;
        };

        $scope.setEventListenerForVisibilityChange = function() {
          var hiddenAttributeName = (
            $scope.determineHiddenAttributeNameForBrowser());
          if (typeof document.addEventListener === 'undefined' ||
            hiddenAttributeName === null) {
            // Browser either doesn't support addEventListener or
            // the Page Visibility API.
          } else {
            var visibilityChange = (
              $scope.determineVisibilityChangeAttributeNameForBrowser());
            if (visibilityChange !== null) {
              document.addEventListener(
                visibilityChange, $scope.onVisibilityChange, false);
            }
          }
        };

        $scope.setEventListenerForVisibilityChange();

        /**
         * Takes you to the Privacy page, if specified.
         */
        $scope.onPrivacyClick = function() {
          if (PRIVACY_URL !== null) {
            $window.open(PRIVACY_URL, '_blank');
          }
        };

        /**
         * Triggers the SendEventBatch method on an interval defined by
         * DEFAULT_EVENT_BATCH_PERIOD_SECONDS.
         */
        if (ServerHandlerService.doesServerExist()) {
          $interval(function() {
            EventHandlerService.sendCurrentEventBatch();
          }, DEFAULT_EVENT_BATCH_PERIOD_SECONDS * SECONDS_TO_MILLISECONDS);
        }

        /**
         * Initializes the appropriate values in $scope for the question
         * instructions, stored code, starter code and feedback.
         */
        var initLearnerViewDirective = function() {
          SessionHistoryService.init();

          // The pulseAnimationEnabled var is set to false to prevent balloon
          // pulse animation when switching from light to dark mode and
          // vise versa. This is set to false in resetCode.
          $scope.pulseAnimationEnabled = false;
          SessionIdService.resetSessionId();

          // Load the feedback, tasks, and stored code and initialize the
          // event services.
          var questionId = CurrentQuestionService.getCurrentQuestionId();
          if (questionId === null) {
            $window.location.href = '/client/404.html';
            return;
          }
          var question = CurrentQuestionService.getCurrentQuestion();
          var tasks = question.getTasks();
          currentTaskIndex = 0;

          $scope.title = question.getTitle();

          $scope.instructions = tasks[currentTaskIndex].getInstructions();
          $scope.previousInstructions = [];
          $scope.languageLabel = SUPPORTED_LANGUAGE_LABELS[
            $scope.codeMirrorOptions.mode];

          UnpromptedFeedbackManagerService.reset(tasks);

          cachedCode = AutosaveService.getLastSavedCode(language);
          $scope.editorContents.code = (
            cachedCode || question.getStarterCode(language));

          EventHandlerService.init(
            SessionIdService.getSessionId(), questionId,
            CurrentQuestionService.getCurrentQuestionVersion());
          EventHandlerService.createQuestionStartEvent();
          EventHandlerService.createTaskStartEvent(
            tasks[currentTaskIndex].getId());

          // Only adds intro message if TIE is iframed, meaning the question
          // is not shown, and there is nothing currently in the feedback
          // window.
          if (ParentPageService.isIframed() &&
            SessionHistoryService.getBindableSessionTranscript().length === 0) {
            SessionHistoryService.addIntroMessageBalloon();
          }
        };

        /**
         * Highlights the syntax errors in the coding UI
         *
         * @param {number} lineNumber
         */
        var highlightLine = function(lineNumber) {
          var actualLineNumber = lineNumber - 1;
          var codeLines = document.querySelectorAll('.CodeMirror-line');
          // This check is needed in cases where the code is something like
          // "def methodName(s):". The syntax error refers to the follow-up
          // line (since the function declaration has no body), but that line
          // is empty so we can't highlight it.
          if (actualLineNumber < codeLines.length) {
            codeLines[actualLineNumber].classList.add(CSS_CLASS_SYNTAX_ERROR);
          }
        };

        /**
         * Clears all highlight from syntax errors in the coding UI
         */
        var clearAllHighlights = function() {
          var codeLines = document.querySelectorAll('.' +
            CSS_CLASS_SYNTAX_ERROR);
          for (var i = 0; i < codeLines.length; i++) {
            codeLines[i].classList.remove(CSS_CLASS_SYNTAX_ERROR);
          }
        };

        /**
         * Displays congratulations when the question is complete.
         * Also sends a QuestionCompleteEvent to the backend.
         */
        $scope.completeQuestion = function() {
          congratulatoryFeedback.clear();
          if ($scope.pageIsIframed) {
            congratulatoryFeedback.appendTextParagraph(
                "Good work! Your code solves this question.");
            congratulatoryFeedback.appendTextParagraph(
                "Click the \"Submit for Grading\" button to get credit!");
            congratulatoryFeedback.appendImageParagraph('congrats_cake.gif');
          } else {
            congratulatoryFeedback.appendTextParagraph(
                "Good work! You've completed this question.");
            congratulatoryFeedback.appendImageParagraph('congrats_cake.gif');
            congratulatoryFeedback.appendTextParagraph(
                "(You can continue to submit additional answers, " +
                "if you wish.)");
          }
          SessionHistoryService.addFeedbackBalloon(
            congratulatoryFeedback.getParagraphs());
          EventHandlerService.createQuestionCompleteEvent();
        };

        /**
         * Sets the feedback to the appropriate text according to the feedback
         * passed into the function.
         *
         * @param {Feedback} feedback
         * @param {string} code
         */
        $scope.setFeedback = function(feedback, code) {
          var question = CurrentQuestionService.getCurrentQuestion();
          var tasks = question.getTasks();
          EventHandlerService.createCodeSubmitEvent(
            tasks[currentTaskIndex].getId(),
            feedback.getParagraphsAsListOfDicts(),
            feedback.getFeedbackCategory(), code);

          if (feedback.isAnswerCorrect()) {
            // If the feedback is correct, create a TaskCompleteEvent first.
            EventHandlerService.createTaskCompleteEvent(
              tasks[currentTaskIndex].getId());
            if (question.isLastTask(currentTaskIndex)) {
              $scope.completeQuestion();
            } else {
              $scope.showNextTask();
            }
          } else {
            var feedbackParagraphs = feedback.getParagraphs();
            var errorLineNumber = feedback.getErrorLineNumber();
            for (var i = 0; i < feedbackParagraphs.length; i++) {
              clearAllHighlights();
              if (errorLineNumber !== null) {
                highlightLine(errorLineNumber);
                break;
              }
            }
            SessionHistoryService.addFeedbackBalloon(feedbackParagraphs);
          }

          // Skulpt processing happens outside an Angular context, so
          // $scope.$apply() is needed to force a DOM update.
          if (!ServerHandlerService.doesServerExist()) {
            $scope.$apply();
          }
          $scope.scrollToTopOfFeedbackWindow();
        };

        /**
         * Sets the code in the code editor to the previous submission
         * passed in as a parameter.
         *
         * @param {number} displaySubmissionNumber The submission number
         * selected in the previous submissions dropdown.
         */
        $scope.changeSubmission = function(displaySubmissionNumber) {
          var previousSubmission = SessionHistoryService.getPreviousSubmission(
            displaySubmissionNumber
          );
          $scope.editorContents.code = previousSubmission;
        };

        /**
         * Stores the CodeMirror editor instance.
         */
        var codemirrorEditorInstance = null;

        /**
         * Returns a copy of the options that are needed to run codeMirror
         * correctly.
         *
         * @param {boolean} enableAccessibility Whether to return the
         * configuration that is optimized for accessible usage.
         */
        var getCodemirrorOptions = function(enableAccessibility) {
          var basicOptions = {
            autofocus: true,
            extraKeys: {
              Tab: function(cm) {
                var spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
                cm.replaceSelection(spaces);
                // Move the cursor to the end of the selection.
                var endSelectionPos = cm.getDoc().getCursor('head');
                cm.getDoc().setCursor(endSelectionPos);
              },
              Esc: function() {
                document.getElementsByClassName(
                  'tie-codemirror-container')[0].focus();
              }
            },
            indentUnit: 4,
            lineNumbers: true,
            matchBrackets: true,
            mode: LANGUAGE_PYTHON,
            onLoad: function(editorInstance) {
              codemirrorEditorInstance = editorInstance;
            },
            smartIndent: true,
            tabSize: 4,
            tabindex: -1,
            theme: 'default'
          };

          if (enableAccessibility) {
            // Note that this option cannot be changed while the CodeMirror
            // instance is running. This mode has some disadvantages for
            // sighted users, e.g. mouse highlighting in the CodeMirror area is
            // not visible.
            basicOptions.inputStyle = 'contenteditable';
            basicOptions.autofocus = false;
          }

          return angular.copy(basicOptions);
        };

        $scope.codeMirrorOptions = getCodemirrorOptions(false);
        $scope.accessibleCodeMirrorOptions = getCodemirrorOptions(true);

        $scope.onKeypressCodemirrorContainer = function(evt) {
          if (evt.keyCode === KEY_CODE_ENTER) {
            // Enter key is pressed.
            evt.preventDefault();
            evt.stopPropagation();
            if (codemirrorEditorInstance) {
              codemirrorEditorInstance.focus();
              showAriaLiveMessage(ARIA_LIVE_MESSAGE_CODEMIRROR_ENTERED);
            }
          }
        };

        $scope.onFocusCodemirrorContainer = function() {
          $scope.accessibleMode = true;
          showAriaLiveMessage(ARIA_LIVE_MESSAGE_CODEMIRROR_CONTAINER_FOCUSED);
        };

        /**
         * Sets the question window to scroll to the top.
         */
        $scope.scrollToTopOfFeedbackWindow = function() {
          questionWindowDiv.scrollTop = 0;
        };

        /**
         * Changes the UI to show the next task and its instructions for the
         * given question.
         */
        $scope.showNextTask = function() {
          var question = CurrentQuestionService.getCurrentQuestion();
          var tasks = question.getTasks();

          currentTaskIndex++;
          $scope.previousInstructions.push($scope.instructions);
          $scope.instructions = tasks[currentTaskIndex].getInstructions();

          SessionHistoryService.reset();
          EventHandlerService.createTaskStartEvent(
            tasks[currentTaskIndex].getId());
        };

        /**
         * Calls the processes necessary to start the code submission process.
         *
         * @param {string} code
         */
        $scope.submitCode = function(code) {
          MonospaceDisplayModalService.hideModal();
          SessionHistoryService.addCodeBalloon(code);

          // Creates a new submission in the previous submissions drop down.
          var submissionNumber = SessionHistoryService.getSubmissionNumber();
          $scope.totalSubmissions.push({number: submissionNumber,
            title: 'Snapshot ' + String(submissionNumber)});
          $scope.currentSubmissionNumber = submissionNumber;

          // Gather all tasks from the first one up to the current one.
          var question = CurrentQuestionService.getCurrentQuestion();
          var tasks = question.getTasks();
          var orderedTasks = tasks.slice(0, currentTaskIndex + 1);
          ConversationManagerService.processSolutionAsync(
            orderedTasks, question.getStarterCode(language),
            code, question.getAuxiliaryCode(language), language
          ).then(function(learnerViewSubmissionResult) {
            var feedback = learnerViewSubmissionResult.getFeedback();
            $scope.setFeedback(feedback, code);
            $scope.stdout = learnerViewSubmissionResult.getStdout();
          });

          $scope.autosaveCode();
        };

        /**
         * Sends the user code to the parent page if the parent page
         * origin matches the expected framing origin.
         *
         * @param {string} rawCode
         */
        $scope.submitToParentPage = function(rawCode) {
          ParentPageService.sendRawCode(rawCode);
          SessionHistoryService.addCodeBalloon(rawCode);
          SessionHistoryService.addSubmissionConfirmationBalloon();
        };

        /**
         * Clears the cached code and the code stored in local storage.
         */
        $scope.resetCode = function() {
          if (currentTaskIndex > 0 &&
              !window.confirm(CODE_RESET_CONFIRMATION_MESSAGE)) {
            return;
          }

          var question = CurrentQuestionService.getCurrentQuestion();
          $scope.editorContents.code = question.getStarterCode(language);
          EventHandlerService.createCodeResetEvent();
          $scope.autosaveCode();

          // Clear the code and feedback from localStorage, so that it is not
          // retrieved in the subsequent initialization.
          SessionHistoryService.reset();

          // Start a brand-new question session.
          initLearnerViewDirective();
        };

        /**
         * Displays a notification for the given number of seconds to let the
         * user know their code has been autosaved.
         *
         * @param {number} displaySeconds
         */
        var triggerAutosaveNotification = function(displaySeconds) {
          $scope.autosaveTextIsDisplayed = true;
          $timeout(function() {
            $scope.autosaveTextIsDisplayed = false;
          }, displaySeconds * SECONDS_TO_MILLISECONDS);
        };

        /**
         * Called when a user code change is detected, with a minimum time of
         * CODE_CHANGE_DEBOUNCE_SECONDS between intervals.
         */
        $scope.onCodeChange = function() {
          var question = CurrentQuestionService.getCurrentQuestion();
          var tasks = question.getTasks();

          if ($scope.codeChangeLoopPromise === null) {
            $scope.codeChangeLoopPromise = $interval(function() {
              if (angular.equals(cachedCode, $scope.editorContents.code)) {
                // No code change, stop the onCodeChange loop.
                $interval.cancel($scope.codeChangeLoopPromise);
                $scope.codeChangeLoopPromise = null;
                return;
              }

              // Code change detected. Actually do the operations that should
              // be triggered by a code change, such as autosaving.
              $scope.autosaveCode();

              // Check for unprompted feedback to add to the feedback log.
              var potentialFeedbackParagraphs = (
                UnpromptedFeedbackManagerService.runTipsCheck(
                  language, $scope.editorContents.code,
                  tasks[currentTaskIndex].getId()));
              if (potentialFeedbackParagraphs !== null) {
                SessionHistoryService.addFeedbackBalloon(
                  potentialFeedbackParagraphs);
              }
            }, CODE_CHANGE_DEBOUNCE_SECONDS * SECONDS_TO_MILLISECONDS);
          }
        };

        /**
         * Saves the user's code to the browser's local storage.
         */
        $scope.autosaveCode = function() {
          cachedCode = $scope.editorContents.code;

          if (LocalStorageService.isAvailable()) {
            AutosaveService.saveCode(language, $scope.editorContents.code);
            triggerAutosaveNotification(DISPLAY_AUTOSAVE_TEXT_SECONDS);
          }
        };

        $scope.autosaveTextIsDisplayed = false;
        CurrentQuestionService.init(initLearnerViewDirective);

        /**
         * Refreshes UI if window loads at 0 height or width (Firefox IFrame
           Case)
         */
        $timeout(function() {
          if ($window.innerWidth === 0 || $window.innerHeight === 0) {
            codemirrorEditorInstance.refresh();
          }
        });
      }
    ]
  };
}]);
