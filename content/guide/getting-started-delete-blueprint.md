---


layout: bt_wiki
title: Deleting a Blueprint
category: Getting Started
publish: true
abstract: Removing a blueprint and its resources
pageord: 700
---


{{% gsSummary %}}


# Overview

At some point, you might want to delete a blueprint you previously updated. Deleting blueprints is, much like deleting a deployment, non-functional. Deleting a blueprint will remove its model from the database and delete its resources from the fileserver.


# Actionable: Delete the Blueprint

To delete a blueprint execute:

{{< gsHighlight  bash >}}
cfy blueprints delete -b nodecellar
{{< /gsHighlight >}}

# What's Next

Next, you can [teardown the Manager](getting-started-teardown.html).