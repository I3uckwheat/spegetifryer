#!/usr/bin/env node



const nunjucks = require('nunjucks');
const fs = require('fs-extra')
const path = require('path');
const findConfig = require('find-config');


/**
 * TODO
 *  - Defualts for config
 *  - Config validation
 *  - Better error handling
 *  - clean up on isle fail
 */

const templatePath = path.resolve(path.join(__dirname, 'templates'));
nunjucks.configure(templatePath, {
  autoscape: false
});

// get dependent's path information
const configPath = findConfig('spegetifryer.json');
const config = require(configPath);

const dependentRoot = path.parse(configPath).dir;

const generatedPath = path.join(dependentRoot, config.outputPath, '.generated');
fs.remove(generatedPath)
  .then(() => {
createOutputPath(config.outputPath);
copyHelpersTo(path.join(dependentRoot, config.outputPath, '.generated'));

  const tableDetails = generateGraphqlFilesContents();
  writeGraphqlFiles(tableDetails);

  const tables = getGraphqlTableDetails();
  writeTableColumnsFiles(tables);

const schemaRoot = generateSchemaRoot();
writeSchemaRoot(schemaRoot);
})
.catch(console.log);



/*******************************************/

function createOutputPath(outputPath) {
  makeDirectorySync(path.join(outputPath));
  makeDirectorySync(path.join(outputPath, '.generated'));
}

function copyHelpersTo(graphqlRoot) {
  const helperFiles = fs.readdirSync(path.join(__dirname, 'assets', 'helpers'));
  
  helperFiles.forEach((filename) => {
    const from = path.join(__dirname, 'assets', 'helpers', filename);
    const to = path.join(graphqlRoot, filename);

    fs.copyFile(from, to, err => {
      if (err) throw err;
    })
  })
}

function generateGraphqlFilesContents() {
  return getTableNames().map(name => {
    const tableDetailsPath = path.join(dependentRoot, config.tableDetailsPath, name);
    const tableDetails = require(tableDetailsPath);
    const contents = nunjucks.render('schema.js.nunjucks', tableDetails);

    return {
      name,
      contents
    }
  })
}

function writeGraphqlFiles(files) {
  files.forEach(file => {
    const basePath = path.join(config.outputPath, '.generated', file.name);
    const fileName = file.name + '.js';

    makeDirectorySync(basePath);
    fs.writeFile(path.join(basePath, fileName), file.contents, err => {
      if (err) throw err;
    });

    makeAddonFiles(file.name);
  })
}

function makeAddonFiles(fileName) {
  makeDirectorySync(path.join(config.outputPath, fileName));

  const fromPath = path.join(__dirname, 'assets', 'customResolver.js');
  const toPath = path.join(config.outputPath, fileName, fileName + '.js');

  if (!fs.existsSync(toPath)) {
    fs.copyFile(fromPath, toPath, err => {
      if (err) throw err;
    });
  }
}

function generateSchemaRoot() {
  const tableNames = getTableNames();
  return nunjucks.render('schemaRoot.js.nunjucks', {
    tableNames
  });
}

function writeSchemaRoot(schemaRoot) {
  fs.writeFile(path.join(config.outputPath, 'schemaRoot.js'), schemaRoot, err => {
    if (err) throw err;
  });
}

function getTableNames() {
  return fs.readdirSync(config.tableDetailsPath)
    .map(fileNames => path.parse(fileNames).name);
}

function makeDirectorySync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}