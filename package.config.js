// ------ Edit the config as you like ------------------
const config = {
  name:           "my-package",
  version:        "0.1.0",
  description:    "",
  keywords:       [],
  main:           "bundle.js",
  es6_main:       "src/Main.js",
  github_user:    "", // github username if your repo is on github.com
  bitbucket_user: "", // bitbucket username if your repo is on bitbucket.org
  author:         "",
  license:        "",
  private:        false
};
// ====== That's it. Do not touch below this line ======
// To apply your config, run:
// $ node ./package.config.js

// package.json template
const pkg = {
  name:        config.name,
  version:     config.version,
  description: config.description,
  main:        config.main,
  files: [
    "src",
    config.main,
    config.main + ".map"
  ],
  exports: {
    "import":  "./" + config.es6_main,
    "require": "./" + config.main
  },
  scripts: {
    "prepublishOnly": "npm run clean && npm run build && npm run test",
    "watch":          "npm-watch",
    "test":           "c8 mocha --enable-source-maps",
    "codecov":        "c8 report --reporter=text-lcov > coverage.lcov && codecov",
    "docs":           "npm run docs:gen && npm run docs:publish",
    "docs:gen":       "npm run docs:clean && jsdoc -c jsdoc.json && cd docs/{name} && ln -sfn $npm_package_version latest",
    "docs:clean":     "rm -rf docs/{name}/$npm_package_version",
    "docs:publish":   "git subtree push --prefix docs/{name} origin gh-pages",
    "clean":          `rm -f '${config.main}' '${config.main}.map' && find . -name '.DS_Store' -not -path '*/node_modules/*' | xargs rm -r`,
    "build":          "rollup -c"
  },
  repository: {
    type: "git"
  },
  keywords: config.keywords,
  author:   config.author,
  license:  config.license,
  private:  config.private
};

if (config.bitbucket_user)   pkg.repository.url = "git+ssh://git@bitbucket.org/{bitbucket_user}/{name}.git";
else if (config.github_user) pkg.repository.url = "git+ssh://git@github.com/{github_user}/{name}.git";
else                         pkg.repository.url = "git+ssh://git@github.com/{YOU}/{name}.git";
if (!pkg.license) pkg.license = "UNLICENSED";

// fetch current package.json if it exists
let current;
try {
  current = require('./package.json');
} catch (e) {
  current = {};
}

// apply config
let r = JSON.stringify(Object.assign(current, pkg), null, 2);
for (let i in config) r = r.replaceAll(`{${i}}`, config[i]);

// save to package.json
const fs = require('fs');
fs.open('./package.json', 'w', (err, fd) => {
  if (err) {
    console.error(`failed to open package.json`);
    throw err;
  }
  fs.write(fd, r, err => {
    if (err) {
      console.error(`failed to write package.json`);
      throw err;
    }
    fs.close(fd, err => {
      if (err) console.error(err);
      console.log(`package.json generated.`);
      console.log(r);
    })
  });
});
