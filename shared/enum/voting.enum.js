"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoterTypeEnum = exports.VotingResultEnum = exports.VotingResponseEnum = void 0;
var VotingResponseEnum;
(function (VotingResponseEnum) {
    VotingResponseEnum["FOR"] = "FOR";
    VotingResponseEnum["AGAINST"] = "AGAINST";
    VotingResponseEnum["ABSTAIN"] = "ABSTAIN";
})(VotingResponseEnum = exports.VotingResponseEnum || (exports.VotingResponseEnum = {}));
var VotingResultEnum;
(function (VotingResultEnum) {
    VotingResultEnum["CARRIED"] = "CARRIED";
    VotingResultEnum["NOT_CARRIED"] = "NOT_CARRIED";
})(VotingResultEnum = exports.VotingResultEnum || (exports.VotingResultEnum = {}));
var VoterTypeEnum;
(function (VoterTypeEnum) {
    VoterTypeEnum["CHAIRMAN"] = "CHAIRMAN";
    VoterTypeEnum["SHAREHOLDER"] = "SHAREHOLDER";
    VoterTypeEnum["PROXY"] = "PROXY";
})(VoterTypeEnum = exports.VoterTypeEnum || (exports.VoterTypeEnum = {}));
//# sourceMappingURL=voting.enum.js.map