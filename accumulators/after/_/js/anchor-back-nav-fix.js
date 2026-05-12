;(function () {
  'use strict'

  function decodeHashFragment(hash) {
    if (!hash || hash.charAt(0) !== '#') return ''
    var frag = hash.slice(1)
    try {
      return decodeURIComponent(frag.replace(/\+/g, ' '))
    } catch (e) {
      return frag
    }
  }

  function scrollTopForTarget(el) {
    var article = document.querySelector('article.doc')
    var toolbar = document.querySelector('.toolbar')
    if (!article || !toolbar || !el || !article.contains(el)) return null
    function sumOffset(node, acc) {
      if (!article.contains(node)) return acc
      return sumOffset(node.offsetParent, acc + node.offsetTop)
    }
    return sumOffset(el, 0) - toolbar.getBoundingClientRect().bottom
  }

  function scrollToId(id) {
    if (!id) {
      /* Let the browser restore scroll for the non-hash history entry (popstate). */
      return
    }
    var el = document.getElementById(id)
    if (!el) return
    var y = scrollTopForTarget(el)
    if (y === null) {
      el.scrollIntoView({ block: 'start', behavior: 'auto' })
      return
    }
    window.scrollTo(0, Math.max(0, y))
  }

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href^="#"]')
      if (!a || e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      var raw = a.getAttribute('href')
      if (!raw || raw === '#' || raw === '#top') return
      if (a.hasAttribute('download')) return
      var id = decodeHashFragment(raw)
      if (!id) return
      var target = document.getElementById(id)
      if (!target) return

      var nextHash = '#' + target.id
      if (window.location.hash === nextHash) {
        e.preventDefault()
        e.stopPropagation()
        if (e.stopImmediatePropagation) e.stopImmediatePropagation()
        scrollToId(target.id)
        return
      }

      e.preventDefault()
      e.stopPropagation()
      if (e.stopImmediatePropagation) e.stopImmediatePropagation()

      if (window.history && typeof window.history.pushState === 'function') {
        try {
          window.history.pushState({ antoraAnchorNav: true, id: target.id }, '', nextHash)
        } catch (err) {
          window.location.hash = nextHash
        }
      } else {
        window.location.hash = nextHash
      }
      scrollToId(target.id)
    },
    true
  )

  window.addEventListener('popstate', function () {
    scrollToId(decodeHashFragment(window.location.hash))
  })

  window.addEventListener('hashchange', function () {
    scrollToId(decodeHashFragment(window.location.hash))
  })
})()
