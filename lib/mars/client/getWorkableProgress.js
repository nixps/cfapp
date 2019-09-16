/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
'use strict';
const workableToLog = require('./workableToLog/workableToLog.js');
const {
    MARSClientError,
    OperationTimeout
} = require('../Errors.js');
const ConsoleOutputStream = require('../../util/ConsoleOutputStream.js');

/**
 * Returns a promise that resolves when the workable is done
 * it also outputs the logs of the workable
 * @param {} apiSync 
 * @param {*} workableId 
 * @param {*} timeoutSeconds 
 */
function getWorkableOutput (apiSync, workableId, timeoutSeconds, outputStream = new ConsoleOutputStream()) {
    return new Promise(function (resolve, reject) {
        let trials = timeoutSeconds || 5 * 60;
        let currentLogIndex = 0;

        function check () {
            if (trials === 0) {
                reject(new OperationTimeout());
                return;
            }

            trials--;
            const progressInfo = apiSync.workable.get_progress(workableId);
            const workable = apiSync.workable.get(workableId);
            const log = workableToLog(workable, progressInfo);
            for (currentLogIndex; currentLogIndex < log.log.length; currentLogIndex++) {
                const messages = log.log[currentLogIndex].messages;
                for (let i = 0; i < messages.length; i++) {
                    const message = messages[i]
                    outputStream.writeLine(`[${message.timeStamp}] - ${message.description}`);
                }
            }

            if (progressInfo.done === true) {
                if (log.error === true) {
                    reject(new MARSClientError(log.errorCode, log.errorMessage));
                    return;
                }
                resolve();
                return;
            } else {
                const {progress} = progressInfo;
                if (progress) {
                    const {activity} = progress;
                    const progressPercentage = Math.round(progress.value * 100);
                    outputStream.writeLine(`Busy in MARS Client workflow node "${activity}" (${progressPercentage}%)`);
                } else {
                    outputStream.writeLine('Busy in MARS Client workflow');
                }
                setTimeout(check, 1000);
            }
        }

        check();
    });
}

module.exports = getWorkableOutput;