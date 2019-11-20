'use strict'
const {InvalidCloudflowVersionError} = require('../../lib/apps/Errors');

/**
 * Returns the Cloudflow major.minor.update triplet as number for comparison
 * @param {*} major A year [19-xx]
 * @param {*} minor A month [1-12]
 * @param {*} update An update number [0-xx]
 */
function versionAsNumber (major, minor, update) {
    // Try to get a number like this MMmmUUUU in order to compare easily
    const current = major * 1000000 + minor * 10000 + update;
    return current;
}

/**
 * Represents a Cloudflow version number
 */
class CloudflowVersion {
    /**
     * Creates a Cloudflow version number by calling the api
     * @param {*} api 
     * @return a promise that resolves to the version number object
     */
    static fromApi (api) {
        return new Promise(function (resolve, reject) {
            api.portal.version(function (result) {
                const {major, minor, rev} = result;
                resolve(new CloudflowVersion(major, minor, rev));
            }, reject);
        });
    }

    /**
     * Creates a Cloudflow version number from a string triplet
     * @param {string} triplet A Cloudflow version number as specified in the project.cfapp
     */
    static fromTriplet (triplet) {
        const matches = triplet.match(/(\d+)\.(\d+)\.(\d+)/);
        if (Array.isArray(matches) === false || matches.length !== 4) {
            throw new InvalidCloudflowVersionError(triplet);
        }

        const major = parseInt(matches[1], 10);
        const minor = parseInt(matches[2], 10);
        const update = parseInt(matches[3], 10);
        return new CloudflowVersion(major, minor, update);
    }

    /**
     * Creates a CloudflowVersion number object from major, minor and update numbers
     */
    constructor (major, minor, update) {
        this._major = major;
        this._minor = minor;
        this._update = update;
    }

    /**
     * Returns true if this version is older than the other version
     * @param {*} otherVersion 
     */
    lt (otherVersion) {
        const { _major, _minor, _update } = this;
        const { _major: _omajor, _minor: _ominor, _update: _oupdate } = otherVersion;
        return versionAsNumber(_major, _minor, _update) < versionAsNumber(_omajor, _ominor, _oupdate)
    }

    /**
     * Returns true if this version is newer than the other version
     * @param {*} otherVersion 
     */
    gt (otherVersion) {
        const { _major, _minor, _update } = this;
        const { _major: _omajor, _minor: _ominor, _update: _oupdate } = otherVersion;
        return versionAsNumber(_major, _minor, _update) > versionAsNumber(_omajor, _ominor, _oupdate)
    }

    /**
     * Returns true if this version is older or equal than the other version
     * @param {*} otherVersion 
     */
    lte (otherVersion) {
        const { _major, _minor, _update } = this;
        const { _major: _omajor, _minor: _ominor, _update: _oupdate } = otherVersion;
        return versionAsNumber(_major, _minor, _update) <= versionAsNumber(_omajor, _ominor, _oupdate)
    }

    /**
     * Returns true if this version is newer or equal than the other version
     * @param {*} otherVersion 
     */
    gte (otherVersion) {
        const { _major, _minor, _update } = this;
        const { _major: _omajor, _minor: _ominor, _update: _oupdate } = otherVersion;
        return versionAsNumber(_major, _minor, _update) >= versionAsNumber(_omajor, _ominor, _oupdate)
    }

    /**
     * Returns the string representation of the vesrion number
     */
    asString () {
        const { _major, _minor, _update } = this;
        if (_update > 0) {
            return `${_major}.${_minor} update ${_update}`;
        }

        return `${_major}.${_minor}`;
    }
}

module.exports = CloudflowVersion;