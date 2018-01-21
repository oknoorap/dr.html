import path from 'path'
import test from 'ava'
import validator from '../index'

const validHtml = path.join(__dirname, 'file1.html')
const invalidHtml = path.join(__dirname, 'file2.html')

const checkWebsite = url => validator(url)
const checkFile = file => validator(file)

test('check https://bing.com, it should be an invalid html', async t => {
  await checkWebsite('https://bing.com').then(result => {
    t.true(result.messages.filter(item => item.type === 'error').length > 0)
  })
})

test('check file1.html file should be valid', async t => {
  await checkFile(validHtml).then(result => {
    t.is(result.messages.filter(item => item.type === 'error').length, 0)
  })
})

test('check file2.html file should be invalid', async t => {
  await checkFile(invalidHtml).then(result => {
    t.true(result.messages.filter(item => item.type === 'error').length > 0)
  })
})

test('check file2.html is missing title', async t => {
  await checkFile(invalidHtml).then(result => {
    result.messages.forEach(item => {
      if (item.message === 'Element “head” is missing a required instance of child element “title”.') {
        t.pass()
      }
    })
  })
})

test('check file2.html has unallowed element context', async t => {
  await checkFile(invalidHtml).then(result => {
    result.messages.forEach(item => {
      if (item.message === 'Element “div” not allowed as child of element “ul” in this context. (Suppressing further errors from this subtree.)') {
        t.pass()
      }
    })
  })
})

test('check html string source should be valid', async t => {
  await validator('<!DOCTYPE html><html><head><title>HTML Source</title></head><body><div id="content">Hello World</div></body></html>').then(result => {
    t.is(result.messages.filter(item => item.type === 'error').length, 0)
  })
})

test('check html string source should be invalid', async t => {
  await validator('<!DOCTYPE html><html><head><title></title></head><body><div id="content">Hello World</div></body></html>').then(result => {
    t.true(result.messages.filter(item => item.type === 'error').length > 0)
  })
})
