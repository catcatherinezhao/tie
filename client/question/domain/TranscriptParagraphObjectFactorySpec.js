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
 * @fileoverview Unit tests for TranscriptParagraphObjectFactory domain objects.
 */

describe('TranscriptParagraphObjectFactory', function() {
  var TranscriptParagraphObjectFactory;
  var FeedbackParagraphObjectFactory;

  beforeEach(module('tie'));
  beforeEach(inject(function($injector) {
    TranscriptParagraphObjectFactory = $injector.get(
      'TranscriptParagraphObjectFactory');
    FeedbackParagraphObjectFactory = $injector.get(
      'FeedbackParagraphObjectFactory');
  }));

  describe('getFeedbackParagraphs', function() {
    it('should correctly retrieve the feedback paragraphs', function() {
      var feedbackParagraph =
        TranscriptParagraphObjectFactory.createFeedbackParagraph([
          FeedbackParagraphObjectFactory.fromDict({
            type: 'text',
            content: 'hello'
          })
        ]);
      expect(feedbackParagraph.getFeedbackParagraphs()).toEqual([
        FeedbackParagraphObjectFactory.fromDict({
          type: 'text',
          content: 'hello'
        })
      ]);

      var codeParagraph = TranscriptParagraphObjectFactory.createCodeParagraph(
        'code');
      expect(codeParagraph.getFeedbackParagraphs()).toEqual([
        FeedbackParagraphObjectFactory.fromDict({
          type: 'code',
          content: 'code'
        })
      ]);
    });
  });

  describe('isCodeSubmission', function() {
    it('should determine if current paragraph is code submission', function() {
      var codeParagraph = TranscriptParagraphObjectFactory.createCodeParagraph(
        'code');
      expect(codeParagraph.isCodeSubmission()).toBe(true);

      var feedbackParagraph =
        TranscriptParagraphObjectFactory.createFeedbackParagraph([
          FeedbackParagraphObjectFactory.fromDict({
            type: 'text',
            content: 'hello'
          })
        ]);
      expect(feedbackParagraph.isCodeSubmission()).toBe(false);
    });
  });

  describe('toDict', function() {
    it('should convert a code paragraph to a dict', function() {
      var codeParagraph = TranscriptParagraphObjectFactory.createCodeParagraph(
        'abc');
      expect(codeParagraph.toDict()).toEqual({
        type: 'code',
        feedbackParagraphContentDicts: [{
          type: 'code',
          content: 'abc'
        }]
      });
    });

    it('should convert a feedback paragraph to a dict', function() {
      var feedbackParagraph =
        TranscriptParagraphObjectFactory.createFeedbackParagraph([
          FeedbackParagraphObjectFactory.fromDict({
            type: 'text',
            content: 'hello'
          })
        ]);
      expect(feedbackParagraph.toDict()).toEqual({
        type: 'feedback',
        feedbackParagraphContentDicts: [{
          type: 'text',
          content: 'hello'
        }]
      });
    });
  });

  describe('fromDict', function() {
    it('should parse a dict representing a code paragraph', function() {
      var codeParagraphDict = {
        type: 'code',
        feedbackParagraphContentDicts: [{
          type: 'code',
          content: 'abc'
        }]
      };

      var codeParagraph = TranscriptParagraphObjectFactory.fromDict(
        codeParagraphDict);
      expect(codeParagraph.isCodeSubmission()).toBe(true);
      expect(codeParagraph.getFeedbackParagraphs().length).toBe(1);
      expect(codeParagraph.getFeedbackParagraphs()[0].toDict()).toEqual({
        type: 'code',
        content: 'abc'
      });

      expect(codeParagraph.toDict()).toEqual(codeParagraphDict);
    });

    it('should parse a dict representing a feedback paragraph', function() {
      var feedbackParagraphDict = {
        type: 'feedback',
        feedbackParagraphContentDicts: [{
          type: 'text',
          content: 'hello'
        }]
      };

      var feedbackParagraph = TranscriptParagraphObjectFactory.fromDict(
        feedbackParagraphDict);
      expect(feedbackParagraph.isCodeSubmission()).toBe(false);
      expect(feedbackParagraph.getFeedbackParagraphs().length).toBe(1);
      expect(feedbackParagraph.getFeedbackParagraphs()[0].toDict()).toEqual({
        type: 'text',
        content: 'hello'
      });

      expect(feedbackParagraph.toDict()).toEqual(feedbackParagraphDict);
    });
  });
});
