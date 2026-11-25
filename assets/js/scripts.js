(function () {
   'use strict';

   var docEl = document.documentElement;

   /* ------------------------------------------------------------ theme */
   var THEME_KEY = 'docs-theme';
   var toggle = document.getElementById('theme-toggle');

   function setTheme(value) {
      docEl.setAttribute('data-theme', value);
      try { localStorage.setItem(THEME_KEY, value); } catch (e) {}
   }

   if (toggle) {
      toggle.addEventListener('click', function () {
         setTheme(docEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
   }

   /* -------------------------------------------------- mobile sidebar */
   var sidebarToggle = document.getElementById('sidebar-toggle');
   var overlay = document.getElementById('sidebar-overlay');

   function closeSidebar() {
      document.body.classList.remove('sidebar-open');
      if (sidebarToggle) { sidebarToggle.setAttribute('aria-expanded', 'false'); }
      if (overlay) { overlay.hidden = true; }
   }

   if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function () {
         var open = document.body.classList.toggle('sidebar-open');
         sidebarToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
         if (overlay) { overlay.hidden = !open; }
      });
   }

   if (overlay) { overlay.addEventListener('click', closeSidebar); }

   document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeSidebar(); }
   });

   /* ------------------------------------------------ submenu toggles */
   var toggles = document.querySelectorAll('.submenu-toggle');

   Array.prototype.forEach.call(toggles, function (button) {
      var li = button.parentNode;
      var submenu = li.querySelector('.submenu');

      // open the branch that holds the current page
      if (li.classList.contains('active') || (submenu && submenu.querySelector('.active'))) {
         li.classList.add('open');
         button.setAttribute('aria-expanded', 'true');
         if (submenu) { submenu.setAttribute('aria-hidden', 'false'); }
      }

      button.addEventListener('click', function (event) {
         event.preventDefault();
         var open = li.classList.toggle('open');
         button.setAttribute('aria-expanded', open ? 'true' : 'false');
         if (submenu) { submenu.setAttribute('aria-hidden', open ? 'false' : 'true'); }
      });
   });

   /* ------------------------------------------------------ table of contents */
   var body = document.getElementById('article-body');
   var list = document.getElementById('toc-list');
   var layout = document.querySelector('.layout');

   if (list && body) {
      var headings = body.querySelectorAll('h2, h3');
      var used = {};
      var links = [];

      Array.prototype.forEach.call(headings, function (heading, index) {
         var text = (heading.textContent || '').trim();
         if (!text) { return; }

         var slug = text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .substring(0, 60) || 'section-' + index;

         if (used[slug]) {
            used[slug] += 1;
            slug = slug + '-' + used[slug];
         } else {
            used[slug] = 1;
         }

         if (!heading.id) { heading.id = slug; }

         var li = document.createElement('li');
         li.className = heading.tagName === 'H3' ? 'toc__item--h3' : 'toc__item--h2';

         var link = document.createElement('a');
         link.href = '#' + heading.id;
         link.textContent = text;
         li.appendChild(link);
         list.appendChild(li);
         links.push({ id: heading.id, link: link });
      });

      if (!links.length) {
         var rail = document.getElementById('toc-rail');
         if (rail) { rail.parentNode.removeChild(rail); }
         if (layout) { layout.classList.add('no-toc'); }
      } else if ('IntersectionObserver' in window) {
         var byId = {};
         links.forEach(function (item) { byId[item.id] = item.link; });

         var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
               if (!entry.isIntersecting) { return; }
               links.forEach(function (item) { item.link.classList.remove('is-active'); });
               var active = byId[entry.target.id];
               if (active) { active.classList.add('is-active'); }
            });
         }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

         Array.prototype.forEach.call(headings, function (heading) {
            if (heading.id) { observer.observe(heading); }
         });
      }
   } else if (layout && !document.querySelector('.toc__list')) {
      layout.classList.add('no-toc');
   }

   /* ------------------------------------------------------- copy buttons */
   var pres = document.querySelectorAll('.prose pre');

   Array.prototype.forEach.call(pres, function (pre) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-btn';
      button.textContent = 'Copy';

      button.addEventListener('click', function () {
         var code = pre.querySelector('code');
         var text = (code || pre).textContent;

         function done() {
            button.textContent = 'Copied';
            setTimeout(function () { button.textContent = 'Copy'; }, 1600);
         }

         if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () {});
         } else {
            var area = document.createElement('textarea');
            area.value = text;
            document.body.appendChild(area);
            area.select();
            try { document.execCommand('copy'); done(); } catch (e) {}
            document.body.removeChild(area);
         }
      });

      pre.appendChild(button);
   });

   /* ------------------------------------------------------------- misc */
   var year = document.getElementById('footer-year');
   if (year) { year.textContent = new Date().getFullYear(); }

   var search = document.getElementById('header-search');
   if (search && !search.querySelector('input')) { search.parentNode.removeChild(search); }

   // close the mobile drawer after following a link
   var navLinks = document.querySelectorAll('.docs-nav a');
   Array.prototype.forEach.call(navLinks, function (link) {
      link.addEventListener('click', function () {
         if (window.matchMedia('(max-width: 900px)').matches) { closeSidebar(); }
      });
   });
})();
