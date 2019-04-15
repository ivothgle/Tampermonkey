// ==UserScript==
// @name         Laravel 文档助手
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Laravel 文档助手
// @author       ivothgle
// @match        *://laravel.com/docs/*
// @match        *://lumen.laravel.com/docs/*
// @match        *://learnku.com/docs/*
// @grant        none
// ==/UserScript==

(function($) {
  'use strict'

  function Learnku () {
    this.init = (jumpCallback) => {
      this.autoSwitchSidebar()
      this.injectOriginalReading(jumpCallback)

      $(document).on('pjax:end', () => {
        this.autoSwitchSidebar()
        this.injectOriginalReading(jumpCallback)
      })
    }

    this.autoSwitchSidebar = () => {
      let isVisible = $('.book-sidemenu').hasClass('visible')
      let widthEnough = this.isWidthEnough()

      if (widthEnough ^ isVisible) {
        $('#right-menu-btn').click()
      }
    }

    this.isWidthEnough = () => {
      let $bookSideMenu = $('.book-sidemenu')
      let $container = $('.main .container')

      if ($bookSideMenu.length && $container.length) {
        return document.body.offsetWidth - $container[0].offsetWidth > $bookSideMenu[0].offsetWidth
      }

      return false
    }

    this.canInject = () =>{
      return /:\/\/learnku\.com\/docs\/(laravel|lumen)\/(\d\.\d)\/([^\/]*)/.test(window.location.href)
    }

    this.getInjectTemplate = (jumpCallback) => {
      return $(`<div class="ui segment text-center" style="padding: 18px 0;">
                  <a class="ui button primary small basic laravel" href="javascript:;"><i class="icon send"></i> Laravel 原文</a>
                </div>`)
        .on('click', '.laravel', { 'target': new Laravel() }, jumpCallback)
    }

    this.injectOriginalReading = (jumpCallback) => {
      if (this.canInject()) {
        let list = $('.item.header.sidebar')

        list.find('.laravel').length || list.children().first().after(this.getInjectTemplate(jumpCallback))
      }
    }

    this.getJumpUrl = (type, version, path) => {
      return `https://learnku.com/docs/${type || 'laravel'}/${version}/${path}${window.location.hash}`
    }
  }

  function Laravel () {
    this.init = (jumpCallback) => {
      this.injectOriginalReading(jumpCallback)
    }

    this.canInject = () =>{
      return /:\/\/(lumen(?=\.))?.?laravel\.com\/docs\/(\d\.\d)\/(.*)/.test(window.location.href)
    }

    this.getInjectTemplate = (jumpCallback) => {
      return $('<li><a class="learnku" href="javascript:;">中文文档</a></li>')
        .on('click', '.learnku', { 'target': new Learnku() }, jumpCallback)
    }

    this.injectOriginalReading = (jumpCallback) => {
      if (this.canInject()) {
        $('.main-nav').prepend(this.getInjectTemplate(jumpCallback))
      }
    }

    this.getJumpUrl = (type, version, path) => {
      return `https://${type === 'laravel' ? '' : type + '.'}laravel.com/docs/${version}/${path}${window.location.hash}`
    }
  }

  function jumpLink (e) {
    let target = window.location.href

    let res = /:\/\/(lumen(?=\.))?.?laravel\.com\/docs\/(\d\.\d)\/(.*)/.exec(target) ||
      /:\/\/learnku\.com\/docs\/(laravel|lumen)\/(\d\.\d)\/([^\/]*)/.exec(target)

    if (res) {
      target = e.data.target.getJumpUrl(res[1], res[2], res[3])
    }

    window.open(target, '_blank')
  }

  function factory () {
    let hostname = window.location.hostname

    if (/learnku\.com/.test(hostname)) {
      return new Learnku()
    } else if (/(lumen\.|)laravel\.com/.test(hostname)) {
      return new Laravel()
    }

    throw new Error('Unknown domain name')
  }

  factory().init(jumpLink)
})(window.$)
