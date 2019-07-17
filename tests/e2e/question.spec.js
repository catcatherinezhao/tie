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
 * @fileoverview Protractor E2E tests for the Question page.
 */

var QuestionPage = browser.params.questionPage;

var testUtils = browser.params.utils;


describe('Question Page', function() {
  var questionPage = new QuestionPage();
  var questionId = browser.params.defaultQuestionId;

  beforeAll(async function() {
    await testUtils.expectNoConsoleLogs();
    await questionPage.get(questionId); 
  });

  beforeEach(async function() {
    await questionPage.clearLocalStorage();
    await questionPage.get(questionId);
  });

  afterEach(async function() {
    await questionPage.clearLocalStorage();    
    // There should be no console output after each test.
    await testUtils.expectNoConsoleLogs();
  });

  it('should successfully submit code', async function() {
    await questionPage.runCode();
  });

  it('should display a feedback text paragraph after a run', async function() {
    await questionPage.runCode();

    // After running code, there should be one or more paragraphs of feedback,
    // since there's no way to reset.
    expect(await questionPage.countFeedbackParagraphs()).toBeGreaterThanOrEqual(1);
  });

  it('should allow switching to previous snapshot with previous button', async function() {
    expect(await questionPage.isPreviousButtonEnabled()).toBe(false);
    await questionPage.setCode('first submission');
    await questionPage.runCode();
    expect(await questionPage.isPreviousButtonEnabled()).toBe(true);
    
    await questionPage.setCode('second submission');
    await questionPage.runCode();
    expect(await questionPage.isPreviousButtonEnabled()).toBe(true);

    await questionPage.clickPreviousButton();
    expect(await questionPage.getCode()).toEqual('first submission');
    expect(await questionPage.isPreviousButtonEnabled()).toBe(true);

    // Retrieve the starter code by clicking the previous button.
    // Should not be able to click on the previous button after since there are no previous
    // snapshots before the starter code.
    await questionPage.clickPreviousButton();
    expect(await questionPage.isPreviousButtonEnabled()).toBe(false);
  });

  it('should allow switching to specific snapshot with snapshot button and menu', async function() {
    await questionPage.setCode('first submission');
    await questionPage.runCode();
    await questionPage.setCode('second submission');
    await questionPage.runCode();

    await questionPage.clickSnapshotButton();
    expect(await questionPage.isSnapshotMenuDisplayed()).toBe(true);
    await questionPage.choosePreviousSnapshot(1);
    expect(await questionPage.getCode()).toEqual('first submission');

    await questionPage.clickSnapshotButton();
    expect(await questionPage.isSnapshotMenuDisplayed()).toBe(true);
    await questionPage.choosePreviousSnapshot(2);
    expect(await questionPage.getCode()).toEqual('second submission'); 
  });

  it('should display snapshot menu after clicking on snapshot button', async function() {
    expect(await questionPage.isSnapshotMenuDisplayed()).toBe(false);
    // Open snapshot menu.
    await questionPage.clickSnapshotButton();
    expect(await questionPage.isSnapshotMenuDisplayed()).toBe(true);
    // Close snapshot menu.
    await questionPage.clickSnapshotButton();
    expect(await questionPage.isSnapshotMenuDisplayed()).toBe(false);
  });

  it('should display all expected links', async function() {
    // Privacy link.
    expect(await questionPage.isPrivacyLinkDisplayed()).toBe(true);
    // About link.
    expect(await questionPage.isAboutLinkDisplayed()).toBe(true);
  });

  it('should display question and coding UIs in 2 columns on large screens',
     async function() {
       await testUtils.setLargeScreen();

       let questionUiLocation = await questionPage.getQuestionUiLocation();
       let questionUiSize = await questionPage.getQuestionUiSize();
       let codingUiLocation = await questionPage.getCodingUiLocation();

       // Coding and Question UIs should be horizontally aligned.
       expect(codingUiLocation.y).toEqual(questionUiLocation.y);

       // Coding UI should be to the right of Question UI.
       expect(codingUiLocation.x)
           .toBeGreaterThan(questionUiLocation.x + questionUiSize.width);
     });

  it('should display question and coding UIs in 2 rows on small screens',
     async function() {
       await testUtils.setSmallScreen();

       let questionUiLocation = await questionPage.getQuestionUiLocation();
       let questionUiSize = await questionPage.getQuestionUiSize();
       let codingUiLocation = await questionPage.getCodingUiLocation();

       // Coding and Question UI should be vertically aligned.
       expect(codingUiLocation.x).toEqual(questionUiLocation.x);

       // Question UI should be above Coding UI.
       expect(codingUiLocation.y)
           .toBeGreaterThan(questionUiLocation.y + questionUiSize.height);
     });

  it('should fit the question and coding UIs in page width on large screens',
     async function() {
       await testUtils.setLargeScreen();

       let windowSize = await testUtils.getWindowSize();

       let codingUiLocation = await questionPage.getCodingUiLocation();
       let codingUiSize = await questionPage.getCodingUiSize();

       // The right edge of the coding UI should be less than the window width.
       expect(codingUiLocation.x + codingUiSize.width)
           .toBeLessThan(windowSize.width);
     });

  it('should fit the question and coding UIs in page width on small screens',
     async function() {
       await testUtils.setSmallScreen();

       let windowSize = await testUtils.getWindowSize();

       let codingUiLocation = await questionPage.getCodingUiLocation();
       let codingUiSize = await questionPage.getCodingUiSize();

       let questionUiLocation = await questionPage.getQuestionUiLocation();
       let questionUiSize = await questionPage.getQuestionUiSize();

       // The right edge of the question UI should be less than the window
       // width.
       expect(questionUiLocation.x + questionUiSize.width)
           .toBeLessThan(windowSize.width);

       // The right edge of the coding UI should be less than the window width.
       expect(codingUiLocation.x + codingUiSize.width)
           .toBeLessThan(windowSize.width);
     });
});
