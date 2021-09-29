// ------ Edit the config as you like ------------------
const conf = {
  name:           'my-package',
  version:        '0.1.0',
  description:    '',
  keywords:       [],
  main:           'bundle.js',   // entry point
  es6_main:       'src/Main.js', // es6 entry point
  test:           'test.js',     // unit test file
  docs:           true,          // support docs?
  github_user:    '', // github username if your repo is on github.com
  bitbucket_user: '', // bitbucket username if your repo is on bitbucket.org
  author:         '',
  license:        '',
  private:        false
};
// ====== That's it. Do not touch below this line ======
// To apply your config, run:
// $ node package.config.js

// package.json
const pkg = {
  name:        conf.name,
  version:     conf.version,
  description: conf.description,
  main:        conf.main,
  files: [
    'src',
    conf.main,
    conf.main + '.map'
  ],
  exports: {
    import:  './' + conf.es6_main,
    require: './' + conf.main
  },
  scripts: {
    prepublishOnly: `npm run clean && npm run build && npm run test`,
    watch:          `npm-watch`,
    test:           `c8 mocha --enable-source-maps`,
    codecov:        `c8 report --reporter=text-lcov > coverage.lcov && codecov`,
    clean:          `rm -f '${conf.main}' '${conf.main}.map' && find . -name '.DS_Store' -not -path '*/node_modules/*' | xargs rm -r`,
    build:          `rollup -c`
  },
  watch: {
    test: {
      inherit: true,
      patterns: [
        conf.test,
        conf.main
      ],
    },
    build: {
      inherit: true,
      patterns: 'src'
    }
  },
  repository: null,
  bugs:       null,
  homepage:   null,
  keywords: conf.keywords,
  author:   conf.author,
  license:  conf.license,
  private:  conf.private
};

// support docs
if (conf.docs) {
  pkg.scripts.docs            = `npm run docs:gen && npm run docs:publish`;
  pkg.scripts['docs:gen']     = `npm run docs:clean && jsdoc -c jsdoc.json && cd docs/${conf.name} && ln -sfn $npm_package_version latest`;
  pkg.scripts['docs:clean']   = `rm -rf docs/${conf.name}/$npm_package_version`;
  pkg.scripts['docs:publish'] = `git subtree push --prefix docs/${conf.name} origin gh-pages`;

  pkg.watch['docs:gen'] = {
    inherit: true,
    patterns: [
      'src',
      'README.md',
      'jsdoc.json'
    ]
  };
}

// set repository URLs
let baseUrl;
if (conf.bitbucket_user)   baseUrl = `bitbucket.org/${conf.bitbucket_user}/${conf.name}`;
else if (conf.github_user) baseUrl = `github.com/${conf.github_user}/${conf.name}`;
if (baseUrl) {
  pkg.repository = { type: 'git', url: `git+ssh://git@${baseUrl}.git` };
  pkg.bugs       = `https://${baseUrl}/issues`;
  pkg.homepage   = `https://${baseUrl}#readme`;
}

// defaults
if (!pkg.license) pkg.license = 'UNLICENSED';

// remove null properties
for (let i in pkg) {
  if (pkg[i] === null) delete pkg[i];
}

// fetch current package.json if it exists
let current;
try {
  current = require('./package.json');
} catch (e) {
  current = {};
}

// merge
let r = JSON.stringify(Object.assign(current, pkg), null, 2);

// save to package.json
const fs = require('fs');
fs.open('./package.json', 'w', (err, fd) => {
  if (err) {
    console.error(`failed to open package.json`);
    throw err;
  }
  fs.write(fd, r, err => {
    fs.close(fd, () => {
      if (err) {
        console.error(`failed to write package.json`);
        throw err;
      }
      console.log(`package.json has been written`);
      console.log(r);
    });
  });
});
