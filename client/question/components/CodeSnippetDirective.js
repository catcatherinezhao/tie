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
 * @fileoverview Directive for showing code snippets.
 */

tie.directive('codeSnippet', [function() {
  return {
    restrict: 'E',
    scope: {
      getContent: '&content'
    },
    template: `
      <span ng-repeat="line in snippetLines track by $index">
        <span class="tie-code-snippet-line">{{line}}</span>
        <br>
      </span>
      <style>
        code-snippet .tie-code-snippet-line {
          font-family: monospace;
          line-height: 16px;
          word-wrap: break-word;
        }
      </style>
    `,
    controller: [
      '$scope',
      function($scope) {
        // The maximum number of lines to show in a code snippet.
        $scope.MAX_NUM_LINES_IN_SNIPPET = 3;

        /**
         * Array of strings that represents the lines in the piece of code
         * that needs to be snippeted.
         *
         * @type {Array}
         */
        $scope.codeLines = [];

        /**
         * Array of strings that represents the snippet lines.
         *
         * @type {Array}
         */
        $scope.snippetLines = [];

        /**
         * Used to change the code snippet whenever the feedback changes.
         */
        $scope.$watch($scope.getContent, function(newValue) {
          // Replace spaces by non-breaking spaces so that multiple spaces do
          // not get collapsed into a single one.
          var htmlFormattedContent = newValue.replace(/ /g, '\u00A0');
          $scope.codeLines = htmlFormattedContent.split('\n');

          $scope.snippetLines = $scope.codeLines.slice(
            0, $scope.MAX_NUM_LINES_IN_SNIPPET);
          if ($scope.codeLines.length > $scope.MAX_NUM_LINES_IN_SNIPPET) {
            $scope.snippetLines.push('...');
          }
        });
      }
    ]
  };
}]);
