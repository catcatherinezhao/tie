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
 * @fileoverview Question page object for Protractor E2E tests.
 */

/**
 * An object that represents the Question page.
 * Provides convenience methods to interact with the page.
 *
 * @constructor
 */
var QuestionPage = function() {
  var questionTestConfig = browser.params.questionTestConfig;
  const pageUrl = '/client/question.html';

  /**
   * TIE wrapper element.
   *
   * @type {webdriver.WebElement}
   */
  var tieWrapperElement = element(by.css('.protractor-test-tie-wrapper'));

  /**
   * Feedback UI element.
   *
   * @type {webdriver.WebElement}
   */
  var feedbackUiElement = element(by.css('.protractor-test-feedback-ui'));

  /**
   * Coding UI element.
   *
   * @type {webdriver.WebElement}
   */
  var codingUiElement = element(by.css('.protractor-test-coding-ui'));

  /**
   * Output UI element.
   *
   * @type {webdriver.WebElement}
   */
  var outputUiElement = element(by.css('.protractor-test-output-ui'));

  /**
   * Run Code button.
   *
   * @type {webdriver.WebElement}
   */
  var runCodeButton = element(by.css('.protractor-test-run-code-button'));

  /**
   * Set of all of the feedback text paragraphs rendered in the DOM.
   *
   * @type {Array.<webdriver.WebElement>}
   */
  var feedbackParagraphs =
      element.all(by.css('.protractor-test-feedback-paragraph'));

  /**
   * Up button to go to previous feedback paragraph.
   *
   * @type {webdriver.WebElement}
   */
  var upFeedbackButton = element(by.css('.protractor-test-up-button'));

  /**
   * Down button to go to next feedback paragraph.
   *
   * @type {webdriver.WebElement}
   */
  var downFeedbackButton = element(by.css('.protractor-test-down-button'));

  /**
   * Previous button.
   *
   * @type {webdriver.WebElement}
   */
  var previousButton = element(by.css('.protractor-test-previous-button'));

  /**
   * Snapshot button.
   *
   * @type {webdriver.WebElement}
   */
  var snapshotButton = element(by.css('.protractor-test-snapshot-button'));

  /**
   * Snapshot menu.
   *
   * @type {webdriver.WebElement}
   */
  var snapshotMenu = element(by.css('.protractor-test-snapshot-menu'));

  /**
   * TIE About link.
   *
   * @type {webdriver.WebElement}
   */
  var aboutLink = element(by.css('.protractor-test-about-link'));

  /**
   * TIE Privacy link.
   *
   * @type {webdriver.WebElement}
   */
  var privacyLink = element(by.css('.protractor-test-privacy-link'));

  /**
   * Retrieves the TIE question page.
   *
   * @param {string} questionId ID of the question to load.
   *
   */
  this.get = async function(questionId) {
    var fullUrl = pageUrl + '?qid=' + questionId;
    await browser.waitForAngularEnabled();
    await browser.get(fullUrl);
  };

  /**
   * Clears local storage.
   */
  this.clearLocalStorage = async function() {
    await browser.executeScript('window.localStorage.clear();');
  }

  /**
   * Simulates writing the given code string in the code editor.
   *
   * @param {string} codeString
   */
  this.setCode = async function(codeString) {
    await browser.executeScript([
      'var editor = ',
      'document.getElementsByClassName(\'CodeMirror\')[0].CodeMirror;',
      'editor.setValue(`' + codeString + '`);'
    ].join(''));
  };

  /**
   * Gets the code string in the code editor.
   */
  this.getCode = async function() {
    var code = await browser.executeScript([
      'var editor = ',
      'document.getElementsByClassName(\'CodeMirror\')[0].CodeMirror;',
      'return editor.getValue();'
    ].join(''));
    return code;
  };

  /**
   * Simulates clicking on the Run Code button.
   */
  this.runCode = async function() {
    await browser.wait(ExpectedConditions.elementToBeClickable(runCodeButton));
    await runCodeButton.click();
    await browser.wait(ExpectedConditions.elementToBeClickable(runCodeButton));
  };

  /**
   * Returns the number of feedback text paragraphs rendered in the DOM.
   *
   * @returns {number}
   */
  this.countFeedbackParagraphs = async function() {
    return await feedbackParagraphs.count();
  };

  /**
   * Returns the content of the feedback paragraph at the given index in the
   * feedback paragraph array.
   *
   * @param {number} index
   * @returns {string}
   */
  this.getFeedbackParagraphText = async function(index) {
    return await feedbackParagraphs.get(index).getText();
  };

  /**
   * Simulates clicking on the up button in the feedback window.
   */
  this.clickUpFeedbackButton = async function() {
    await browser.wait(ExpectedConditions.elementToBeClickable(upFeedbackButton));
    await upFeedbackButton.click();
  }

  /**
   * Simulates clicking on the down button in the feedback window.
   */
  this.clickDownFeedbackButton = async function() {
    await browser.wait(ExpectedConditions.elementToBeClickable(downFeedbackButton));
    await downFeedbackButton.click();
  }

  /**
   * Simulates clicking on the Previous button.
   */
  this.clickPreviousButton = async function() {
    await browser.wait(ExpectedConditions.elementToBeClickable(previousButton));
    await previousButton.click();
  }

  /**
   * Simulates clicking on the Snapshot button.
   */
  this.clickSnapshotButton = async function() {
    await browser.wait(ExpectedConditions.elementToBeClickable(snapshotButton));
    await snapshotButton.click();
    await browser.wait(ExpectedConditions.elementToBeClickable(snapshotButton));
  }

  /**
   * Simulates selecting a previous snapshot which list index is the passed index.
   *
   * @param {number} snapshotIndex index of the snapshot chosen
   */
  this.choosePreviousSnapshot = async function(snapshotIndex) {
    await browser.wait(ExpectedConditions.elementToBeClickable(snapshotMenu.all(by.css('ul li')).get(snapshotIndex)));
    await snapshotMenu.all(by.css('ul li')).get(snapshotIndex).click();
  };

  /**
   * Returns true if the up feedback button is enabled.
   *
   * @returns {boolean}
   */
  this.isUpFeedbackButtonEnabled = async function() {
    return await upFeedbackButton.isEnabled();
  }

  /**
   * Returns true if the down feedback button is enabled.
   *
   * @returns {boolean}
   */
  this.isDownFeedbackButtonEnabled = async function() {
    return await downFeedbackButton.isEnabled();
  }

  /**
   * Returns true if the up feedback button is present on the page.
   *
   * @returns {boolean}
   */
  this.isUpFeedbackButtonPresent = async function() {
    return await upFeedbackButton.isPresent();
  }

  /**
   * Returns true if the down feedback button is present on the page.
   *
   * @returns {boolean}
   */
  this.isDownFeedbackButtonPresent = async function() {
    return await downFeedbackButton.isPresent();
  }

  /**
   * Returns true if the up feedback button is displayed on the page.
   *
   * @returns {boolean}
   */
  this.isUpFeedbackButtonDisplayed = async function() {
    return await upFeedbackButton.isDisplayed();
  }

  /**
   * Returns true if the down feedback button is displayed on the page.
   *
   * @returns {boolean}
   */
  this.isDownFeedbackButtonDisplayed = async function() {
    return await downFeedbackButton.isDisplayed();
  }

  /**
   * Returns true if the previous button is enabled.
   *
   * @returns {boolean}
   */
  this.isPreviousButtonEnabled = async function() {
    return await previousButton.isEnabled();
  }

  /**
   * Returns true if the snapshot menu is displayed on the page.
   *
   * @returns {boolean}
   */
  this.isSnapshotMenuDisplayed = async function() {
    return await snapshotMenu.isDisplayed();
  }

  /**
   * Returns true if the Python primer link is displayed on the page.
   *
   * @returns {boolean}
   */
  this.isPythonPrimerLinkDisplayed = async function() {
    return await pythonPrimerLink.isDisplayed();
  };

  /**
   * Returns true if the About link is displayed on the page.
   *
   * @returns {boolean}
   */
  this.isAboutLinkDisplayed = async function() {
    return await aboutLink.isDisplayed();
  };

  /**
   * Returns true if the Privacy link is displayed on the page.
   *
   * @returns {boolean}
   */
  this.isPrivacyLinkDisplayed = async function() {
    return await privacyLink.isDisplayed();
  };

  /**
   * Returns the question UI element location.
   *
   */
  this.getFeedbackUiLocation = async function() {
    return await feedbackUiElement.getLocation();
  };

  /**
   * Returns the question UI element size.
   *
   */
  this.getFeedbackUiSize = async function() {
    return await feedbackUiElement.getSize();
  };

  /**
   * Returns the coding UI element location.
   *
   */
  this.getCodingUiLocation = async function() {
    return await codingUiElement.getLocation();
  };

  /**
   * Returns the coding UI element size.
   *
   */
  this.getCodingUiSize = async function() {
    return await codingUiElement.getSize();
  };

  /**
   * Returns the output UI element location.
   *
   */
  this.getOutputUiLocation = async function() {
    return await outputUiElement.getLocation();
  };

  /**
   * Returns the output UI element size.
   *
   */
  this.getOutputUiSize = async function() {
    return await outputUiElement.getSize();
  };
};

module.exports = QuestionPage;
