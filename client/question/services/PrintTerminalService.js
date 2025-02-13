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
 * print-enabled and print-disabled versions of TIE.
 */
tie.factory('PrintTerminalService', [
  'ALLOW_PRINTING', 'ALLOW_ERROR_PRINTING',
  function(ALLOW_PRINTING, ALLOW_ERROR_PRINTING) {
    return {
      /**
       * Returns whether or not printing to stdout is supported.
       *
       * @return {boolean} True if printing is supported, false if not.
       */
      isPrintingSupported: function() {
        return ALLOW_PRINTING;
      },
      /**
       * Returns whether or not printing errors to stdout is supported.
       *
       * @return {boolean} True if printing errors is supported, false if not.
       */
      isErrorPrintingSupported: function() {
        return ALLOW_ERROR_PRINTING;
      }
    };
  }
]);
