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
 * @fileoverview Unit tests for FeedbackDisplayService.
 */

describe('FeedbackDisplayService', function() {
  var FeedbackDisplayService;

  beforeEach(module('tie'));
  var setFeedbackConfig = function(isSupported) {
    module('tieConfig', function($provide) {
      $provide.constant('ALLOW_FEEDBACK', isSupported);
    });
  };

  describe("isFeedbackSupported", function() {
    it('should return true if feedback is supported', function() {
      setFeedbackConfig(true);
      inject(function($injector) {
        FeedbackDisplayService = $injector.get('FeedbackDisplayService');
      });
      expect(FeedbackDisplayService.isFeedbackSupported()).toEqual(true);
    });

    it('should return false if feedback is not supported', function() {
      setFeedbackConfig(false);
      inject(function($injector) {
        FeedbackDisplayService = $injector.get('FeedbackDisplayService');
      });
      expect(FeedbackDisplayService.isFeedbackSupported()).toEqual(false);
    });
  });
});
