const Octokat = require('octokat');
const octo = new Octokat();

const fs = require('fs');
const { promisify } = require('util');

const publishingRepositories = [
  "macchina-dev/arduino-boards-sam"
]

function createRepo(qualifiedRepoName) {
  const pieces = qualifiedRepoName.split('/');
  return octo.repos(pieces[0], pieces[1]);
}

function getReleases(repository) {
  const repo = createRepo(repository);
  return repo.releases.fetchAll();
}

async function getPlatform(release) {
  const platform = release.assets.filter(a => a.name === 'platform.json')[0]

  return JSON.parse(await platform.browserDownload.fetch());
}

async function main() {

  // NB. this is Flat-map
  releaseArrays = await Promise.all(publishingRepositories.map(getReleases))
  const releases = [].concat.apply([], releaseArrays);

  const index = {
    packages: [
      {
        name: "macchina",
        maintainer: "Macchina",
        websiteURL: "https://www.macchina.cc",
        email: "info@macchina.cc",
        help: {
          online: "https://forum.macchina.cc/"
        },
        platforms: await Promise.all(releases.map(getPlatform)),
        tools: []
      }
    ]

  }

  return JSON.stringify(index, undefined, 2);
}

if (require.main === module) {
  main(process.argv)
    .then(s => console.log(s))
    .catch(error => {
      console.error(error);
      process.exit(2);
    });
}
