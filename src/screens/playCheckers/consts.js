const consts = {};

const addConst = (name) => {
    consts[name] = name;
};

addConst('DARK');
addConst('LIGHT');

module.exports = consts;