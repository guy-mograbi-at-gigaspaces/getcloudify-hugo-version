---


layout: bt_wiki
title: Plugin Installer Plugin
category: Official Plugins
publish: true
abstract: "Cloudify plugin installer description"
pageord: 650
---


{{% gsSummary %}}
{{% /gsSummary %}}


# Description

The plugin installer plugin is responsible for installing Cloudify plugins on Cloudify agents and is pre-installed on every Cloudify agent installed using Cloudify's Linux/Windows agent installer.


# Automatic Plugins Installation

When installing a deployment, Cloudify automatically identifies which plugins need to be installed and where (Management/Application machine) and invokes the plugin installer's **install** operation which receives a list of plugins required to be installed.


# Plugin Requirements:

* Python Versions:
  * 2.6.x
  * 2.7.x


# Usage

User custom workflows which require plugin installations should invoke the plugin installer's **install** operation - `plugin_installer.tasks.install`.

Plugin installer's **install** operation receives a `plugins` argument which is a list of plugins to install.

Each item in the provided plugins list should be a dictionary containing the following keys:

* `name` - the name of the plugin (as defined in the setup.py file).
* `source` - Can be one of:

    - URL (http, https) to the plugin archive.
    - relative path to a folder inside <blueprint_root>/plugins

* `install_arguments` - Optional arguments passed to the 'pip install' command created for the plugin installation
* `install` - true to install, false to ignore. (Default to true)
* `executor` - Can be one of:

    - host_agent - Indicates this plugin will be executed by a blueprint host type
    - central_deployment_agent - Indicates this plugin will be executed by the central deployment agent created  <br>
                                 after running 'deployments create...'

{{% gsNote title="Note" %}}
Plugin definition must contain the 'executor' key
{{% /gsNote %}}


In order for installed plugins to be recognized by Cloudify's agent, it is required to restart the agent by invoking the following task - `worker_installer.tasks.restart`.


## Example:

For the following setup.py file:
{{< gsHighlight  python  >}}
from setuptools import setup

setup(
    name='cloudify-bash-plugin',
    version='1.1',
    ...
)
{{< /gsHighlight >}}

The following `plugins` argument should be provided:

{{< gsHighlight  python  >}}

plugins = [
  {
    'name': cloudify-bash-plugin,
    'source': https://github.com/cloudify-cosmo/cloudify-bash-plugin/archive/1.1.zip,
    'install': true,
    'executor': host_agent
  }
]

{{< /gsHighlight >}}
