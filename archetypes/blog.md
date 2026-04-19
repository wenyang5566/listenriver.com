---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
categories:
  - ""
tags:
  - ""
summary: ""
description: ""
cover:
  image: "cover.jpg"
  alt: ""
featured: false
---

Put the cover image next to `index.md` and name it `cover.jpg`.

![Image description](photo-1.jpg)

Add any other images to the same folder and reference them with relative paths.
