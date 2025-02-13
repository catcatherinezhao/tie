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
 * @fileoverview Service that provides a way to run different methods on the
 * feedback-enabled and feedback-disabled versions of TIE.
 */
tie.factory('FeedbackDisplayService', [
  'ALLOW_FEEDBACK',
  function(ALLOW_FEEDBACK) {
    return {
      /**
       * Returns whether or not displaying the feedback window is supported.
       *
       * @return {boolean} True if feedback is supported, false if not.
       */
      isFeedbackSupported: function() {
        return ALLOW_FEEDBACK;
      }
    };
  }
]);
