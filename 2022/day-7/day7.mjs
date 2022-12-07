import {getLinesForDay} from '../../util/utility.mjs'

async function run(testMode) {
  const fileSystem = await getData(testMode)
  console.log(`Total Size Under 100k = ${getSizeOfDirectoriesUnder100000(fileSystem)}`)
  let spaceToFree = 30000000 - (70000000 - fileSystem.size)
  console.log(spaceToFree)
  console.log(`Size of Dir to free up space = ${getSizeOfDirToFreeUpSpace(fileSystem, spaceToFree)}`)
}

function getSizeOfDirectoriesUnder100000(pwd){
  let totalSize = 0
  if(pwd.size < 100000){
    totalSize += pwd.size
  }
  for(const childDir of Object.values(pwd.dirs)){
    totalSize += getSizeOfDirectoriesUnder100000(childDir)
  }
  return totalSize
}

function getSizeOfDirToFreeUpSpace(pwd, spaceToFree){
  let smallestDir = Number.MAX_SAFE_INTEGER
  if(pwd.size < smallestDir && pwd.size > spaceToFree){
    smallestDir = pwd.size
  }
  for(const childDir of Object.values(pwd.dirs)){
    let smallestChildDir = getSizeOfDirToFreeUpSpace(childDir, spaceToFree)
    if(smallestChildDir < smallestDir){
      smallestDir = smallestChildDir
    }
  }
  return smallestDir
}

function getEmptyDir(parent = null){
  return {parent, dirs:{}, files:{}, size:0}
}

async function getData(isTest) {
  const lines = await getLinesForDay(2022, 7, isTest)
  let fileSystem = getEmptyDir()
  let pwd = fileSystem
  let isListingDir = false
  for(let line of lines){
    if(line.startsWith('$ cd')){
      isListingDir = false
      if(line === '$ cd ..'){
        pwd = pwd.parent || pwd
      } else {
        let splitLine = line.split(' ')
        pwd = pwd.dirs[splitLine[2]] || pwd
      }
    } else if(line.startsWith('$ ls')){
      isListingDir = true
    } else if(isListingDir){
      let splitLine = line.split(' ')
      if(splitLine[0] === 'dir'){
        pwd.dirs[splitLine[1]] = getEmptyDir(pwd)
      } else {
        const fileSize = Number(splitLine[0])
        if(!pwd.files[splitLine[1]]){
          pwd.files[splitLine[1]] = fileSize
          pwd.size += fileSize
          let sizeDir = pwd.parent
          while(sizeDir){
            sizeDir.size += fileSize
            sizeDir = sizeDir.parent
          }
        }
      }
    }
  }
  return fileSystem
 }

export {run}