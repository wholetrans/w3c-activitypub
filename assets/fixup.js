/******************************************************************************
 *                 JS Extension for the W3C Spec Style Sheet                  *
 *                                                                            *
 * This code handles:                                                         *
 * - some fixup to improve the table of contents                              *
 * - the obsolete warning on outdated specs                                   *
 * - modified by CDN18: remove analytics, add translations, make assets local *
 ******************************************************************************/
(function () {
  "use strict";
  var ESCAPEKEY = 27;
  var collapseSidebarText = '<span aria-hidden="true">←</span> '
    + '<span>折叠侧边栏</span>';
  var expandSidebarText = '<span aria-hidden="true">→</span> '
    + '<span>弹出侧边栏</span>';
  var tocJumpText = '<span aria-hidden="true">↑</span> '
    + '<span>跳转到目录</span>';

  var sidebarMedia = window.matchMedia('screen and (min-width: 78em)');
  var autoToggle = function (e) { toggleSidebar(e.matches) };
  if (sidebarMedia.addEventListener) {
    sidebarMedia.addEventListener('change', autoToggle);
  }

  function toggleSidebar(on, skipScroll) {
    if (on == undefined) {
      on = !document.body.classList.contains('toc-sidebar');
    }

    if (!skipScroll) {
      /* Don't scroll to compensate for the ToC if we're above it already. */
      var headY = 0;
      var head = document.querySelector('.head');
      if (head) {
        // terrible approx of "top of ToC"
        headY += head.offsetTop + head.offsetHeight;
      }
      skipScroll = window.scrollY < headY;
    }

    var toggle = document.getElementById('toc-toggle');
    var tocNav = document.getElementById('toc');
    if (on) {
      var tocHeight = tocNav.offsetHeight;
      document.body.classList.add('toc-sidebar');
      document.body.classList.remove('toc-inline');
      toggle.innerHTML = collapseSidebarText;
      if (!skipScroll) {
        window.scrollBy(0, 0 - tocHeight);
      }
      tocNav.focus();
      sidebarMedia.addEventListener('change', autoToggle); // auto-collapse when out of room
    }
    else {
      document.body.classList.add('toc-inline');
      document.body.classList.remove('toc-sidebar');
      toggle.innerHTML = expandSidebarText;
      if (!skipScroll) {
        window.scrollBy(0, tocNav.offsetHeight);
      }
      if (toggle.matches(':hover')) {
        /* Unfocus button when not using keyboard navigation,
           because I don't know where else to send the focus. */
        toggle.blur();
      }
    }
  }

  function createSidebarToggle() {
    /* Create the sidebar toggle in JS; it shouldn't exist when JS is off. */
    var toggle = document.createElement('a');
    /* This should probably be a button, but appearance isn't standards-track.*/
    toggle.id = 'toc-toggle';
    toggle.class = 'toc-toggle';
    toggle.href = '#toc';
    toggle.innerHTML = collapseSidebarText;

    sidebarMedia.addEventListener('change', autoToggle);
    var toggler = function (e) {
      e.preventDefault();
      sidebarMedia.removeEventListener('change', autoToggle); // persist explicit off states
      toggleSidebar();
      return false;
    }
    toggle.addEventListener('click', toggler, false);


    /* Get <nav id=toc-nav>, or make it if we don't have one. */
    var tocNav = document.getElementById('toc-nav');
    if (!tocNav) {
      tocNav = document.createElement('p');
      tocNav.id = 'toc-nav';
      /* Prepend for better keyboard navigation */
      document.body.insertBefore(tocNav, document.body.firstChild);
    }
    /* While we're at it, make sure we have a Jump to Toc link. */
    var tocJump = document.getElementById('toc-jump');
    if (!tocJump) {
      tocJump = document.createElement('a');
      tocJump.id = 'toc-jump';
      tocJump.href = '#toc';
      tocJump.innerHTML = tocJumpText;
      tocNav.appendChild(tocJump);
    }

    tocNav.appendChild(toggle);
  }

  var toc = document.getElementById('toc');
  if (toc) {
    if (!document.getElementById('toc-toggle')) {
      createSidebarToggle();
    }
    toggleSidebar(sidebarMedia.matches, true);

    /* If the sidebar has been manually opened and is currently overlaying the text
       (window too small for the MQ to add the margin to body),
       then auto-close the sidebar once you click on something in there. */
    toc.addEventListener('click', function (e) {
      if (document.body.classList.contains('toc-sidebar') && !sidebarMedia.matches) {
        var el = e.target;
        while (el != toc) { // find closest <a>
          if (el.tagName.toLowerCase() == "a") {
            toggleSidebar(false);
            return;
          }
          el = el.parentElement;
        }
      }
    }, false);
  }
  else {
    console.warn("找不到目录。请在目录周围使用 <nav id='toc'> 标签。");
  }

  /* Amendment Diff Toggling */
  var showDiff = function (event) {
    var a = event.target.parentElement.parentElement;
    var ins = document.querySelectorAll("ins[cite='#" + a.id + "'], #" + a.id + " ins");
    var del = document.querySelectorAll("del[cite='#" + a.id + "'], #" + a.id + " del");
    ins.forEach(function (e) { e.hidden = false; e.classList.remove("diff-inactive") });
    del.forEach(function (e) { e.hidden = false; e.classList.remove("diff-inactive") });
    a.querySelectorAll("button[value=diff]")[0].disabled = true;
    a.querySelectorAll("button[value=old]")[0].disabled = false;
    a.querySelectorAll("button[value=new]")[0].disabled = false;
  }
  var showOld = function (event) {
    var a = event.target.parentElement.parentElement;
    var ins = document.querySelectorAll("ins[cite='#" + a.id + "'], #" + a.id + " ins");
    var del = document.querySelectorAll("del[cite='#" + a.id + "'], #" + a.id + " del");
    ins.forEach(function (e) { e.hidden = true; e.classList.add("diff-inactive") });
    del.forEach(function (e) { e.hidden = false; e.classList.add("diff-inactive") });
    a.querySelectorAll("button[value=diff]")[0].disabled = false;
    a.querySelectorAll("button[value=old]")[0].disabled = true;
    a.querySelectorAll("button[value=new]")[0].disabled = false;
  }
  var showNew = function (event) {
    var a = event.target.parentElement.parentElement;
    var ins = document.querySelectorAll("ins[cite='#" + a.id + "'], #" + a.id + " ins");
    var del = document.querySelectorAll("del[cite='#" + a.id + "'], #" + a.id + " del");
    ins.forEach(function (e) { e.hidden = false; e.classList.add("diff-inactive") });
    del.forEach(function (e) { e.hidden = true; e.classList.add("diff-inactive") });
    a.querySelectorAll("button[value=diff]")[0].disabled = false;
    a.querySelectorAll("button[value=old]")[0].disabled = false;
    a.querySelectorAll("button[value=new]")[0].disabled = true;
  }
  var amendments = document.querySelectorAll('[id].amendment, [id].correction, [id].addition');
  amendments.forEach(function (a) {
    var ins = document.querySelectorAll("ins[cite='#" + a.id + "'], #" + a.id + " ins");
    var del = document.querySelectorAll("del[cite='#" + a.id + "'], #" + a.id + " del");
    if (ins.length == 0 && del.length == 0) { return; }

    var tbar = document.createElement('div');
    tbar.lang = 'en'; tbar.class = 'amendment-toggles';

    var toggle = document.createElement('button');
    toggle.value = 'diff'; toggle.innerHTML = 'Show Change'; toggle.disabled = true;
    toggle.addEventListener('click', showDiff, false);
    tbar.appendChild(toggle);

    toggle = document.createElement('button');
    toggle.value = 'old'; toggle.innerHTML = 'Show Current';
    toggle.addEventListener('click', showOld, false);
    tbar.appendChild(toggle);

    toggle = document.createElement('button');
    toggle.value = 'new'; toggle.innerHTML = 'Show Future';
    toggle.addEventListener('click', showNew, false);
    tbar.appendChild(toggle);

    a.appendChild(tbar);
  });

  /* Wrap tables in case they overflow */
  var tables = document.querySelectorAll(':not(.overlarge) > table.data, :not(.overlarge) > table.index');
  var numTables = tables.length;
  for (var i = 0; i < numTables; i++) {
    var table = tables[i];
    if (!table.matches('.example *, .note *, .advisement *, .def *, .issue *')) {
      /* Overflowing colored boxes looks terrible, and also
         the kinds of tables inside these boxes
         are less likely to need extra space. */
      var wrapper = document.createElement('div');
      wrapper.className = 'overlarge';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  }

  /* Dark mode toggle */
  const darkCss = document.querySelector('link[rel~="stylesheet"][href^="/assets/dark.css"]');
  if (darkCss) {
    const colorScheme = localStorage.getItem("tr-theme") || "auto";
    darkCss.disabled = colorScheme === "light";
    darkCss.media = colorScheme === "auto" ? "(prefers-color-scheme: dark)" : "";
    const render = document.createElement("div");
    function createOption(option) {
      const checked = option === colorScheme;
      return `
        <label>
          <input name="color-scheme" type="radio" value="${option}" ${checked ? "checked" : ""}>
          <span>${option}</span>
        </label>
      `.trim();
    }
    render.innerHTML = `
      <a id="toc-theme-toggle" role="radiogroup" aria-label="选择配色方案">
        <span aria-hidden="true"><img src="logos/dark.svg" title="主题切换按钮" /></span>
        <span>
        ${["light", "dark", "auto"].map(createOption).join("")}
        </span>
      </a>
    `;
    const changeListener = (event) => {
      const { value } = event.target;
      darkCss.disabled = value === "light";
      darkCss.media = value === "auto" ? "(prefers-color-scheme: dark)" : "";
      localStorage.setItem("tr-theme", value);
    };
    render.querySelectorAll("input[type='radio']").forEach((input) => {
      input.addEventListener("change", changeListener);
    });

    var tocNav = document.querySelector('#toc-nav');
    tocNav.appendChild(...render.children);
  }
})();
