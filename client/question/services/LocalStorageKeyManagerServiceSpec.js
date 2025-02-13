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
 * @fileoverview Unit tests for the LocalStorageKeyManagerService.
 */

describe('LocalStorageKeyManagerService', function() {
  var LocalStorageKeyManagerService;

  beforeEach(module('tie'));
  beforeEach(inject(function($injector) {
    LocalStorageKeyManagerService = $injector.get(
      'LocalStorageKeyManagerService');
  }));

  describe('last-saved code key generation', function() {
    it('should correctly generate last-saved code key', function() {
      expect(LocalStorageKeyManagerService.getLastSavedCodeKey(
        'tieid', 'qid', 'python')).toBe(
        'tie:tieid:lastSavedCode:qid:python');
      expect(LocalStorageKeyManagerService.getLastSavedCodeKey(
        'tieid2', 'qid2', 'python')).toBe(
        'tie:tieid2:lastSavedCode:qid2:python');
    });
  });

  describe('session history key generation', function() {
    it('should correctly generate session history key', function() {
      expect(LocalStorageKeyManagerService.getSessionHistoryKey(
        'tieid', 'qid', 1)).toBe(
        'tie:tieid:sessionHistory:qid:1');
      expect(LocalStorageKeyManagerService.getSessionHistoryKey(
        'tieid2', 'qid2', 2)).toBe(
        'tie:tieid2:sessionHistory:qid2:2');
    });
  });
});
