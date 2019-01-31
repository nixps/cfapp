/*
 *  Copyright (c) 2017 NiXPS, All rights reserved.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
'use strict';
const _ = require('lodash');
var hasMARSProcessError = require('./hasMARSProcessError');

function workableToLog (workable, progress) {
    // Get the log of the workable
    var log = workable.log;
    var logs = [];

    var Severities = {
        'debug': 0,
        'info': 1,
        'warning': 2,
        'error': 3
    };

    for (var i = 0; i < log.length; i++) {
        var current = log[i];
        if (typeof current.node_name !== 'string') {
            continue;
        }

        try {
            var currentMessages = current.messages;
            var messages = [];
            var severity = 'info';
            if (Array.isArray(currentMessages) === true) {
                for(var j = 0; j < currentMessages.length; j++) {
                    var currentMessage = currentMessages[j];
                    var messageSeverity = currentMessage.severity;
                    if (Severities[messageSeverity] > Severities[severity]) {
                        severity = messageSeverity;
                    }
                    var description = currentMessage.description;
                    messages.push({
                        severity: messageSeverity,
                        timeStamp: currentMessage.when,
                        description: description
                    });
                }
            }

            logs.push({
                step: current.node_name,
                severity: severity,
                timeStamp: current.start,
                messages: messages
            });
        } catch(error) {
            // eslint-disable-next-line no-console
            console.log(error);
        }
    }

    var progressPercentage = false;
    if (_.isPlainObject(progress.progress)) {
        progressPercentage = progress.progress.value;
    }

    var errorCode = '';
    var errorMessage = '';
    if (hasMARSProcessError(workable)) {
        var processInfo = workable.variables.processInfo;
        if (typeof processInfo.errorCode === 'string') {
            errorCode = processInfo.errorCode;
        }

        if (typeof processInfo.errorMessage === 'string') {
            errorMessage = processInfo.errorMessage;
        }
    } else {
        if (typeof workable.variables.errorCode === 'string') {
            errorCode = workable.variables.errorCode;
        }

        if (typeof workable.variables.errorMessage === 'string') {
            errorMessage = workable.variables.errorMessage;
        }
    }

    return {
        error: workable.state === 'error',
        running: workable.done !== true,
        errorCode: errorCode,
        errorMessage: errorMessage,
        log: logs,
        currentStep: progress.node_name || '',
        progress: progressPercentage
    };
}

module.exports = workableToLog;
