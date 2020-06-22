const fs = require('fs-extra')
const glob = require('glob')
const Jimp = require('jimp')
const ora = require('ora')

// config
const SOURCE_DIR = './'
const OUTPUT_DIR = './dist'

// variables
const spinner = ora()

// utils
const delay = (msec=250) => new Promise(resolve => setTimeout(() => resolve(), msec))

async function main () {
  try {
    spinner.color = 'yellow'
    spinner.start('Build started')
    
    await delay(1000)

    // glob(`${SOURCE_DIR}/**/*.md`, {}, (er, files) => {
    //   console.log({ files })
    // })

    // glob(`${SOURCE_DIR}/**/assets`, {}, (er, files) => {
    //   console.log({ files })
    // })

    // cleanup
    await fs.remove(`${OUTPUT_DIR}`)

    // build pages
    spinner.start('Building pages')
    await fs.copy(`${SOURCE_DIR}/pages`, `${OUTPUT_DIR}/pages`)
    await delay(1000)

    // build images
    spinner.start('Building images')
    glob(`${OUTPUT_DIR}/**/images/*`, {}, (er, images) => {
      images.forEach(async image_filename => {
        const last_index = image_filename.lastIndexOf('.')
        const high_filename = image_filename.substr(0, last_index) + '-high' + image_filename.substr(last_index)
        const low_filename = image_filename.substr(0, last_index) + '-50px' + image_filename.substr(last_index)

        // create image variants
        await fs.copy(image_filename, high_filename)
        await fs.copy(image_filename, low_filename)
        // remove original image
        await fs.remove(image_filename)

        // resize high
        const hi_image = await Jimp.read(high_filename)
        hi_image
          .resize(1200, Jimp.AUTO)
          .quality(80)
          .writeAsync(high_filename)

        // resize low
        const lo_image = await Jimp.read(low_filename)
        lo_image
          .resize(50, Jimp.AUTO)
          .quality(80)
          .writeAsync(low_filename)
      })
    })
    await delay(1000)

    // report
    spinner.succeed('images built')
    spinner.succeed('pages built')
  }
  catch (err) {
    spinner.fail('Error:')
    console.log(err)
  }
}

main()



// duplicate pages to /dist
// resize images to /dist/images
