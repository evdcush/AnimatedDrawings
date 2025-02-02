# Animated Drawings

![Sequence 02](https://user-images.githubusercontent.com/6675724/219223438-2c93f9cb-d4b5-45e9-a433-149ed76affa6.gif)


This repo contains an implementation of the algorithm described in the paper, `A Method for Automatically Animating Children's Drawings of the Human Figure' (currenly under peer review). 

In addition, this repo aims to be a useful creative tool in its own right, allowing you to flexibly create animations starring your own drawn characters. If you do create something fun with this, let us know! Use hashtag **#FAIRAnimatedDrawings**


## Installation

We *strongly* recommend activating a Python virtual environment prior to installing Animated Drawings. 
Conda's Miniconda is a great choice. Follow [these steps](https://conda.io/projects/conda/en/stable/user-guide/install/index.html) to download and install it. Then run the following commands:

````bash
    # create and activate the virtual environment
    conda create --name animated_drawings python=3.8.13
    conda activate animated_drawings

    # clone AnimatedDrawings and use pip to install
    git clone git@github.com:fairinternal/AnimatedDrawings.git
    cd AnimatedDrawings
    pip install -e .
````

Mac M1/M2 users: if you get architecture errors, make sure your `~/.condarc` does not have `osx-64`, but only `osx-arm64` and `noarch` in its subdirs listing. You can see that it's going to go sideways as early as `conda create` because it will show `osx-64` instead of `osx-arm64` versions of libraries under "The following NEW packages will be INSTALLED".

## Using Animated Drawings

### Quick Start
Now that everything's set up, let's animate some drawings! To get started, follow these steps:
1. Open a terminal and activate the animated_drawings conda environment:
````bash 
~ % conda activate animated_drawings
````

2. Ensure you're in the root directory of AnimatedDrawings:
````bash
(animated_drawings) ~ % cd {location of AnimatedDrawings on your computer}
````

3. Start up a Python interpreter:
````bash
(animated_drawings) AnimatedDrawings % python
````

4. Copy and paste the follow two lines into the interpreter:
````python
from animated_drawings import render
render.start('./examples/config/mvc/interactive_window_example.yaml')
````
    
If everything is installed correctly, an interactive window should appear on your screen. 
(Use spacebar to pause/unpause the scene, arrow keys to move back and forth in time, and q to close the screen.)

<img src='./media/interactive_window_example.gif' width="256" height="256" /> </br></br></br>

There's a lot happening behind the scenes here. Characters, motions, scenes, and more are all controlled by configuration files, such as `interactive_window_example.yaml`. Below, we show how different effects can be achieved by varying the config files. You can learn more about the [config files here](examples/config/README.md).

### Export MP4 video

Suppose you'd like to save the animation as a video file instead of viewing it directly in a window. Specify a different example config by copying these lines into the Python interpreter:

````python
from animated_drawings import render
render.start('./examples/config/mvc/export_mp4_example.yaml')
````

Instead of an interactive window, the animation was saved to a file, video.mp4, located in the same directory as your script.

<img src='./media/mp4_export_video.gif' width="256" height="256" /> </br></br></br>

### Export transparent .gif

Perhaps you'd like a transparent .gif instead of an .mp4? Copy these lines in the Python interpreter intead:

````python
from animated_drawings import render
render.start('./examples/config/mvc/export_gif_example.yaml')
````

Instead of an interactive window, the animation was saved to a file, video.gif, located in the same directory as your script.

<img src='./media/gif_export_video.gif' width="256" height="256" /> </br></br></br>

### Headless Rendering

If you'd like to generate a video headlessly (e.g. on a remote server accessed via ssh), you'll need to specify `USE_MESA: True` within the `view` section of the config file.

````yaml
    view:
      USE_MESA: True
````

### Animating Your Own Drawing

All of the examples above use drawings with pre-existing annotations.
To understand what we mean by *annotations* here, look at one of the 'pre-rigged' character's [annotation files](examples/characters/char1/).
You can use whatever process you'd like to create those annotations files and, as long as they are valid, AnimatedDrawings will give you an animation.

So you'd like to animate your own drawn character.
I wouldn't want to you to create those annotation files manually. That would be tedious.
To make it fast and easy, we've trained a drawn humanoid figure detector and pose estimator and provided scripts to automatically generate annotation files from the model predictions.

To get it working, you'll need to set up a Docker container that runs TorchServe.
This allows us to quickly show your image to our machine learning models and receive their predictions.

To set up the container, follow these steps:

1. [Install Docker Desktop](https://docs.docker.com/get-docker/)
2. Ensure Docker Desktop is running.
3. Run the following commands, starting from the Animated Drawings root directory:

````bash
    (animated_drawings) AnimatedDrawings % cd torchserve

    # build the docker image... this takes a while (~5-7 minutes on Macbook Pro 2021)
    (animated_drawings) torchserve % docker build -t docker_torchserve .

    # start the docker container and expose the necessary ports
    (animated_drawings) torchserve % docker run -d --name docker_torchserve -p 8080:8080 -p 8081:8081 docker_torchserve
````

Wait ~10 seconds, then ensure Docker and TorchServe are working by pinging the server:

````bash
    (animated_drawings) torchserve % curl http://localhost:8080/ping

    # should return:
    # {
    #   "status": "Healthy"
    # }
````

If, after waiting, the response is `curl: (52) Empty reply from server`, one of two things is likely happening.
1. Torchserve hasn't finished initializing yet, so wait another 10 seconds and try again.
2. Torchserve is failing because it doesn't have enough RAM.  Try [increasing the amount of memory available to your Docker containers](https://docs.docker.com/desktop/settings/mac/#advanced) to 16GB by modifying Docker Desktop's settings.

With that set up, you can now go directly from image -> animation with a single command:

````bash
    (animated_drawings) torchserve % cd ../examples
    (animated_drawings) examples % python image_to_animation.py drawings/garlic.png garlic_out
````

As you waited, the image located at `drawings/garlic.png` was analyzed, the character detected, segmented, and rigged, and it was animated using BVH motion data from a human actor.
The resulting animation was saved as `./garlic_out/video.gif`.

<img src='./examples/drawings/garlic.png' height="256" /><img src='./media/garlic.gif' width="256" height="256" /></br></br></br>

### Fixing bad predictions
You may notice that, when you ran `python image_to_animation.py drawings/garlic.png garlic_out`, there were addition non-video files within `garlic_out`.
`mask.png`, `texture.png`, and `char_cfg.yaml` contain annotation results of the image character analysis step. These annotations were created from our model predictions.
If the predictions were incorrect, you can manually fix the annotations.
The segmentation mask is a grayscale image that can be edited in Photoshop or Paint.
The skeleton joint locations within char_cfg.yaml can be edited with a text editor (though you'll want to read about the [character config](examples/config/README.md) files first.)


Once you've modified annotations, you can render an animation using them like so:

````bash
    # specify the folder where the fixed annoations are located
    (animated_drawings) examples % python annotations_to_animation.py garlic_out
````

### Adding multiple characters to scene
Multiple characters can be added to a video by specifying multiple entries within the config scene's 'ANIMATED_CHARACTERS' list.
To see for yourself, run the following commands from a Python interpreter within the AnimatedDrawings root directory:

````python
from animated_drawings import render
render.start('./examples/config/mvc/multiple_characters_example.yaml')
````
<img src='./examples/characters/char1/texture.png' height="256" /> <img src='./examples/characters/char2/texture.png' height="256" /> <img src='./media/multiple_characters_example.gif' height="256" />

### Adding a background image
Suppose you'd like to add a background to the animation. You can do so by specifying the image path within the config. 
Run the following commands from a Python interpreter within the AnimatedDrawings root directory:

````python
from animated_drawings import render
render.start('./examples/config/mvc/background_example.yaml')
````

<img src='./examples/characters/char4/texture.png' height="256" /> <img src='./examples/characters/char4/background.png' height="256" /> <img src='./media/background_example.gif' height="256" />

### Using BVH Files with Different Skeletons
You can use any motion clip you'd like, as long as it is in BVH format.

If the BVH's skeleton differs from the examples used in this project, you'll need to create a new motion config file and retarget config file.
Once you've done that, you should be good to go.
The following code and resulting clip uses a BVH with completely different skeleton.
Run the following commands from a Python interpreter within the AnimatedDrawings root directory:

````python
from animated_drawings import render
render.start('./examples/config/mvc/different_bvh_skeleton_example.yaml')
````

<img src='./media/different_bvh_skeleton_example.gif' height="256" />

### Creating Your Own BVH Files
You may be wondering how you can create BVH files of your own. 
You used to need a motion capture studio. 
But now, thankfully, there are simple and accessible options for getting 3D motion data from a single RGB video. 
For example, I created this Readme's banner animation by: 
1. Recording myself doing a silly dance with my phone's camera.
2. Using [Rokoko](https://www.rokoko.com/) to export a BVH from my video.
3. Creating new motion config and retarget config files to fit the skeleton exported by Rokoko.
4. Using AnimatedDrawings to animate the characters and export a transparent animated gif.
5. Combining the animated gif, original video, and original drawings in Adobe Premiere.


<img src='https://user-images.githubusercontent.com/6675724/219223438-2c93f9cb-d4b5-45e9-a433-149ed76affa6.gif' height="256" />


### Adding addition character skeletons
To be added later, if requested.

### Creating Your Own Config Files
If you want to create your own config files, see the [configuration file documentation](examples/config/README.md).

## Browser-Based Demo

If you'd like to animate a drawing of your own, but don't want to deal with downloading code and using the command line, check out our browser-based demo:

[www.sketch.metademolab.com](https://sketch.metademolab.com/)

## Citation
If you find this repo helpful in your own work, please consider citing the accompanying paper:

(citation information to be added later)

## Amateur Drawings Dataset
(Instructions for how to obtain dataset to be added later).

## As-Rigid-As-Possible Shape Manipulation

These characters are deformed using [As-Rigid-As-Possible (ARAP) shape manipulation](https://www-ui.is.s.u-tokyo.ac.jp/~takeo/papers/takeo_jgt09_arapFlattening.pdf).
We have a Python implementation of the algorithm, located [here](https://github.com/fairinternal/AnimatedDrawings/blob/main/animated_drawings/model/arap.py), that might be of use to other developers.

## Licensing

This work is released under a [Creative Commons Attribution-NonCommercial 4.0 license](https://creativecommons.org/licenses/by-nc/4.0/).
This license precludes commercial use. 
**If you are interested in using this work commercially, please email jesse dot smith at meta dot com.**
