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

const {kMarsClientWhitepaper} = require('../constants.js');
const {CloudfowReadyOperationTimeout} = require('../Errors.js');

/**
 * Promise that resolves when all the resources are available to run MARS on that client
 *  
 */
function isClientReady (api, pTimeout) {
    let timeout = pTimeout || 300;

    function isReady () {
        const result = api.whitepaper.list(['name', 'equal to', kMarsClientWhitepaper, 'and', 'template', 'does not exist']);
        if (result.results.length === 0) {
            return false;
        }

        const whitepaper = result.results[0];
        const neededCollars = _.uniq(_.map(whitepaper.nodes, (n) => n.collar));

        const foundCollars = api.bluecollardefinition.list(['identifier', 'in', neededCollars]);
        const foundUniqueCollarIds = _.uniq(_.map(foundCollars.results, (c) => c.identifier));
        
        return foundUniqueCollarIds.length === neededCollars.length;
    }
    
    return new Promise(function (resolve, reject) {
        function doCheck () {
            if (isReady()) {
                resolve();
                return;
            } else {
                timeout--;
    
                if (timeout < 0) {
                    reject(new CloudfowReadyOperationTimeout());
                    return;
                }
    
                setTimeout(doCheck, 1000);
            }
        }

        doCheck();
    });
}

module.exports = isClientReady;