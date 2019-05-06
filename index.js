const Octokat = require('octokat');
const token = process.env['GITHUB_TOKEN'];
const octo = token ? new Octokat({ token }) : new Octokat();

const { promisify } = require('util');

var rp = require('request-promise-native');

const publishingRepositories = [
  "macchina/arduino-boards-sam"
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
  // skip this release if platform.json does not exist
  if(platform == null) {
    return
  }
  return JSON.parse(await rp(platform.browserDownloadUrl));
}

function clean(obj) {
  for (var propName in obj) { 
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
}

async function main() {

  // NB. this is Flat-map
  releaseArrays = await Promise.all(publishingRepositories.map(getReleases))
  const releases = [].concat.apply([], releaseArrays)
  plat = await Promise.all(releases.map(getPlatform))
  // remove any releases for which there is no associated platform.json
  clean(plat);
  var platformArray = []
  for (var i in plat) {
      platformArray.push(plat[i])
  }
  //for (var i in platformArray) {
  //    console.error("platformArray[" + i + "]=" + JSON.stringify(platformArray[i], null, 2));
  //}

  const index = {
    packages: [
      {
        name: "macchina",
        maintainer: "Macchina",
        websiteURL: "https://github.com/macchina/arduino-boards-index",
        email: "info@macchina.cc",
        help: {
          online: "https://forum.macchina.cc/"
        },
        platforms: platformArray,
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
