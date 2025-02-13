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
 * @fileoverview Unit tests for PrintTerminalService.
 */

describe('PrintTerminalService', function() {
  var PrintTerminalService;

  beforeEach(module('tie'));
  var setPrintingConfig = function(isSupported) {
    module('tieConfig', function($provide) {
      $provide.constant('ALLOW_PRINTING', isSupported);
    });
  };
  var setErrorPrintingConfig = function(isSupported) {
    module('tieConfig', function($provide) {
      $provide.constant('ALLOW_ERROR_PRINTING', isSupported);
    });
  };

  describe("isPrintingSupported", function() {
    it('should return true if printing is supported', function() {
      setPrintingConfig(true);
      inject(function($injector) {
        PrintTerminalService = $injector.get('PrintTerminalService');
      });
      expect(PrintTerminalService.isPrintingSupported()).toEqual(true);
    });

    it('should return false if printing is not supported', function() {
      setPrintingConfig(false);
      inject(function($injector) {
        PrintTerminalService = $injector.get('PrintTerminalService');
      });
      expect(PrintTerminalService.isPrintingSupported()).toEqual(false);
    });
  });

  describe("isErrorPrintingSupported", function() {
    it('should return true if error printing is supported', function() {
      setErrorPrintingConfig(true);
      inject(function($injector) {
        PrintTerminalService = $injector.get('PrintTerminalService');
      });
      expect(PrintTerminalService.isErrorPrintingSupported()).toEqual(true);
    });

    it('should return false if error printing is not supported', function() {
      setErrorPrintingConfig(false);
      inject(function($injector) {
        PrintTerminalService = $injector.get('PrintTerminalService');
      });
      expect(PrintTerminalService.isErrorPrintingSupported()).toEqual(false);
    });
  });
});
