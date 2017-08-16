# cfapp

## Description

This a command line tool to install and download Cloudflow Applications.

## Installation

Install with the following npm command:

    sudo npm install -g cfapp

After that the cfapp command becomes available.

## Cloudflow Applications

A Cloudflow Application is a directory structure like this:

    project.cfapp
    workflows/*
    files/*

At the root there is a cfapp file that describes the application, workflows and
files.  The application workflows are put in the workflows directory.  Assets
needed for the application are put in the files directory.

## Usage

Basic usage:

    # prints the help text
    cfapp

    # creates a default project.cfapp file in the current directory
    cfapp app init

    # installs a remote application
    cfapp app upload /path/to/the/application/

    # shows the help of the 'app upload' command
    cfapp app upload --help

    # downloads a remote application
    cfapp app download /path/to/the/download/location/

By default cfapp will not overwrite files or workflows in the remote Cloudflow
or on the local filesystem.  You can override this behavior with the --overwrite option:

    # overwrite existing files and workflows on the remote Cloudflow
    cfapp app upload /path/to/the/application/ --overwrite
