/**
	Copyright 2019 University of Denver

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.

	You may obtain a copy of the License at
	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

 /**
 * @file 
 *
 * Pdf Utility Functions
 * Synchronous wrappers for async external pdf library functions
 *
 */

'use strict';

const fs = require('fs');
const {PdfCounter} = require('page-count');

exports.getPageCountSync = async function(pdfPath) {
        var numPages = null;
        const dataBuffer =fs.readFileSync(pdfPath);
        numPages = await PdfCounter.count(dataBuffer, "pdf");
        return numPages;
  }

