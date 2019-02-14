const fs = require('fs')
const path = require('path')
const loaderUtils = require('loader-utils')
const cache = new Map()

module.exports = function(source) {
  this.cacheable()
  const _cb = this.async()

  const zones = loaderUtils.getOptions(this).zones
  // Validate params
  if (!Array.isArray(zones) || zones.some(_ => typeof _ !== 'string')) {
    return error(new Error('Provide required timezones as a list in options property "zones"'))
  }

  const resourcePath = this.resourcePath
  if (path.basename(resourcePath) !== 'index.js') {
    // Only apply the loader if the import resolves to index.js.
    // Otherwise we'd end up with a circular dependency because the
    // loader would be reapplied to the return value.
    return success(source)
  }
  const dataFilePath = path.dirname(resourcePath) + '/data/packed/latest.json'
  const str = JSON.stringify
  function shouldIncludeZone(zoneConfig) {
    const zone = zoneConfig.substring(0, zoneConfig.indexOf('|'))
    return zones.includes(zone)
  }

  const cacheKey = `${resourcePath}.....${zones}`
  if (cache.has(cacheKey)) {
    console.log('cache hit', cacheKey)
    return success(cache.get(cacheKey))
  }

  fs.readFile(dataFilePath, 'utf8', (err, result) => {
    if (err) { return error(err) }
    try {
      const fullTimezoneData = JSON.parse(result)
      const timezoneData = Object.assign(fullTimezoneData, {
        zones: fullTimezoneData.zones.filter(shouldIncludeZone),
        links: fullTimezoneData.links.filter(shouldIncludeZone),
      })

      const generatedModule = `
          import momentTimezone from './moment-timezone.js'
          momentTimezone.tz.load(${str(timezoneData)})
          export default momentTimezone
        `
      cache.set(cacheKey, generatedModule)
      return success(generatedModule)
    } catch (err) {
      return error(err)
    }
  })

  function error(err) {
    _cb(err || new Error('Unknown error occurred'))
  }

  function success(result) {
    _cb(null, result)
  }
}
