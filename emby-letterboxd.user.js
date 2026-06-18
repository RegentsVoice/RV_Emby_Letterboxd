// ==UserScript==
// @name         Emby Letterboxd
// @namespace    https://github.com/RegentsVoice/RV_Emby_Letterboxd/
// @version      1.5
// @description  Добавляет Letterboxd в ссылки на Emby
// @author       Regent'sVoice
// @match        *://*/web/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function isEmby() {
        return document.querySelector('.emby-scrollbuttons, .emby-tabs, .itemLinks, .pageTitleWithDefaultLogo') !== null;
    }

    function addLetterboxd(container) {
        const imdb = container.querySelector('a[href*="imdb.com/title/tt"]');
        if (!imdb) return false;

        if (container.querySelector('a[href*="letterboxd.com"]')) return true;

        const id = imdb.href.match(/tt\d+/);
        if (!id) return false;

        const link = document.createElement('a');
        link.is = 'emby-linkbutton';
        link.className = 'button-link button-link-color-inherit button-link-fontweight-inherit emby-button emby-button-focusscale';
        link.href = `https://letterboxd.com/imdb/${id[0]}/`;
        link.target = '_blank';
        link.textContent = 'Letterboxd';

        const last = container.lastElementChild;
        if (last && !last.textContent.trim().endsWith(',')) {
            last.textContent += ',';
        }

        container.appendChild(link);
        return true;
    }

    let containerObserver = null;
    let currentContainer = null;

    function setupContainerObserver(container) {
        if (containerObserver) {
            containerObserver.disconnect();
        }
        currentContainer = container;
        containerObserver = new MutationObserver(() => {
            if (currentContainer && document.contains(currentContainer)) {
                addLetterboxd(currentContainer);
            }
        });
        containerObserver.observe(container, { childList: true, subtree: true });
        addLetterboxd(container);
    }

    const rootObserver = new MutationObserver((mutations) => {
        if (!isEmby()) return;

        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    if (node.matches && node.matches('.itemLinks')) {
                        setupContainerObserver(node);
                    }
                    if (node.querySelector && node.querySelector('.itemLinks')) {
                        const container = node.querySelector('.itemLinks');
                        setupContainerObserver(container);
                    }
                }
            }
            if (mutation.target && mutation.target.matches && mutation.target.matches('.itemLinks')) {
                setupContainerObserver(mutation.target);
            }
            if (mutation.target.parentElement && mutation.target.parentElement.matches && mutation.target.parentElement.matches('.itemLinks')) {
                setupContainerObserver(mutation.target.parentElement);
            }
        }
    });

    rootObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    if (isEmby()) {
        const existingContainer = document.querySelector('.itemLinks');
        if (existingContainer) {
            setupContainerObserver(existingContainer);
        }
    }

    setInterval(() => {
        if (!isEmby()) return;
        const container = document.querySelector('.itemLinks');
        if (container) {
            if (container !== currentContainer) {
                setupContainerObserver(container);
            } else {
                addLetterboxd(container);
            }
        }
    }, 1000);
})();