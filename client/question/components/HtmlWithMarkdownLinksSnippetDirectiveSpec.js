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
 * @LearnerViewDirective Unit tests for the LearnerViewDirective.
 *
 */

describe('HtmlWithMarkdownLinksSnippetDirective', function() {
  var parentScope;
  var scope;
  var template;
  var PRIMER_DIRECTORY_URL;

  beforeEach(module('tie'));
  beforeEach(inject(function($injector, $compile, $rootScope) {
    PRIMER_DIRECTORY_URL = $injector.get('PRIMER_DIRECTORY_URL');

    parentScope = $rootScope.$new();
    parentScope.parentContent = '';
    template = $compile(
      '<html-with-markdown-links-snippet content="parentContent">' +
      '</html-with-markdown-links-snippet>')(parentScope);
    scope = template.isolateScope();
    scope.$digest();
  }));

  describe('parsing', function() {
    it('should correctly parse strings as HTML', function() {
      parentScope.parentContent = 'abc';
      scope.$digest();
      expect(template.html()).toContain('abc');

      parentScope.parentContent = 'x&y';
      scope.$digest();
      expect(template.html()).toContain('x&amp;y');
      expect(template.html()).not.toContain('x&y');

      parentScope.parentContent = '3 < 4';
      scope.$digest();
      expect(template.html()).toContain('3 &lt; 4');
      expect(template.html()).not.toContain('3 < 4');

      parentScope.parentContent = '<script>gotcha!</script>Other text';
      scope.$digest();
      expect(template.html()).toContain('Other text');
      expect(template.html()).not.toContain('gotcha!');
      expect(template.html()).not.toContain('script');

      parentScope.parentContent = 'abc<a href="link">def</a>ghi';
      scope.$digest();
      expect(template.html()).toContain('abc<a href="link">def</a>ghi');
    });

    it('should correctly interpolate links', function() {
      parentScope.parentContent = 'abc [def](https://www.google.com)';
      scope.$digest();
      expect(template.html()).toContain(
        'abc <a href="https://www.google.com" target="_blank">def</a>');

      parentScope.parentContent = 'abc [def](primer-url)';
      scope.$digest();
      expect(template.html()).toContain(
        'abc <a href="' + PRIMER_DIRECTORY_URL +
        'py-primer.html" target="_blank">def</a>');
    });

    it('should reject badly-formatted links', function() {
      parentScope.parentContent = 'abc[[def]](https://www.google.com)';
      scope.$digest();
      expect(template.html()).toContain('abc[[def]](https://www.google.com)');
      expect(template.html()).not.toContain('<a');

      parentScope.parentContent = 'abc[def]](https://www.google.com)';
      scope.$digest();
      expect(template.html()).toContain('abc[def]](https://www.google.com)');
      expect(template.html()).not.toContain('<a');
    });

    it('should reject non-HTTPS and non-primer links', function() {
      parentScope.parentContent = 'abc [def](ghi) jkl';
      scope.$digest();
      expect(template.html()).toContain('abc  jkl');
      expect(template.html()).not.toContain('<a');

      parentScope.parentContent = 'abc [def](http://www.google.com) jkl';
      scope.$digest();
      expect(template.html()).toContain('abc  jkl');
      expect(template.html()).not.toContain('<a');

      parentScope.parentContent = 'abc [def](../hello) jkl';
      scope.$digest();
      expect(template.html()).toContain('abc  jkl');
      expect(template.html()).not.toContain('<a');
    });
  });
});
