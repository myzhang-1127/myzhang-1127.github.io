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

  function toolbarOverlapPx() {
    var toolbar = document.querySelector('.toolbar')
    if (!toolbar) return 0
    return Math.max(0, toolbar.getBoundingClientRect().bottom)
  }

  /**
   * Scroll an element into view under the fixed Boost toolbar.
   * Avoids walking offsetParent (null offsetParent made the old sumOffset call
   * article.contains(null) and threw after preventDefault — “dead” in-page links).
   */
  function scrollElementUnderToolbar(el) {
    if (!el) return
    el.scrollIntoView({ block: 'start', behavior: 'auto' })
    var overlap = toolbarOverlapPx()
    if (overlap > 0) window.scrollBy(0, -overlap)
  }

  function scrollToId(id) {
    if (!id) {
      /* Non-hash history entry: let the browser restore scroll on popstate. */
      return
    }
    var el = document.getElementById(id)
    if (!el) return
    scrollElementUnderToolbar(el)
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
        scrollElementUnderToolbar(target)
        return
      }

      e.preventDefault()
      e.stopPropagation()
      if (e.stopImmediatePropagation) e.stopImmediatePropagation()

      var path = window.location.pathname + window.location.search + nextHash
      if (window.history && typeof window.history.pushState === 'function') {
        try {
          window.history.pushState({ antoraAnchorNav: true, id: target.id }, '', path)
        } catch (err) {
          window.location.hash = nextHash
        }
      } else {
        window.location.hash = nextHash
      }
      /* Defer until after URL / layout settle (avoids occasional no-op scroll). */
      requestAnimationFrame(function () {
        scrollElementUnderToolbar(target)
      })
    },
    true
  )

  window.addEventListener('popstate', function () {
    requestAnimationFrame(function () {
      scrollToId(decodeHashFragment(window.location.hash))
    })
  })

  window.addEventListener('hashchange', function () {
    requestAnimationFrame(function () {
      scrollToId(decodeHashFragment(window.location.hash))
    })
  })
})()
