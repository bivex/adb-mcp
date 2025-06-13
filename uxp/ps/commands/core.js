/* MIT License
 *
 * Copyright (c) 2025 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { app, constants, action } = require("photoshop");
const fs = require("uxp").storage.localFileSystem;

const {
    _saveDocumentAs,
    parseColor,
    getAlignmentMode,
    getNewDocumentMode,
    selectLayer,
    findLayer,
    execute,
    tokenify,
    hasActiveSelection
} = require("./utils")

const { rasterizeLayer } = require("./layers").commandHandlers;

const openFile = async (command) => {

    let options = command.options    

    await execute(async () => {

        let entry = null
        try {
            entry = await fs.getEntryWithUrl("file:" + options.filePath)
        } catch (e) {
            throw new Error("openFile: Could not create file entry. File probably does not exist.");
        }
     
        await app.open(entry)
    });
}

const placeImage = async (command) => {
    let options = command.options;
    let layerName = options.layerName;
    let layer = findLayer(layerName);

    if (!layer) {
        throw new Error(`placeImage : Could not find layerName : ${layerName}`);
    }

    await execute(async () => {
        selectLayer(layer, true);
        let layerId = layer.id;

        let imagePath = await tokenify(options.imagePath);


        let commands = [
            // Place
            {
                ID: layerId,
                _obj: "placeEvent",
                freeTransformCenterState: {
                    _enum: "quadCenterState",
                    _value: "QCSAverage",
                },
                null: {
                    _kind: "local",
                    _path: imagePath,
                },
                offset: {
                    _obj: "offset",
                    horizontal: {
                        _unit: "pixelsUnit",
                        _value: 0.0,
                    },
                    vertical: {
                        _unit: "pixelsUnit",
                        _value: 0.0,
                    },
                },
                replaceLayer: {
                    _obj: "placeEvent",
                    to: {
                        _id: layerId,
                        _ref: "layer",
                    },
                },
            },
            {
                _obj: "set",
                _target: [
                    {
                        _enum: "ordinal",
                        _ref: "layer",
                        _value: "targetEnum",
                    },
                ],
                to: {
                    _obj: "layer",
                    name: layerName,
                },
            },
        ];

        await action.batchPlay(commands, {});
        await rasterizeLayer(command);
    });
};



const getDocumentInfo = async (command) => {
    try {
        if (!app.activeDocument) {
            throw new Error('[getDocumentInfo] No active document found.');
        }
        const doc = app.activeDocument;
        const path = doc.path;
        const layers = doc.layers || [];
        const activeLayer = doc.activeLayers && doc.activeLayers.length > 0 ? doc.activeLayers[0] : null;

        const out = {
            name: doc.name || null,
            width: doc.width,
            height: doc.height,
            resolution: doc.resolution,
            colorMode: doc.mode ? doc.mode.toString() : null,
            pixelAspectRatio: doc.pixelAspectRatio,
            path: path,
            saved: path && path.length > 0,
            hasUnsavedChanges: doc.saved === false,
            numberOfLayers: layers.length,
            activeLayerName: activeLayer ? activeLayer.name : null,
            layerNames: layers.map(l => l.name),
        };
        console.log('[getDocumentInfo] Document info:', out);
        return out;
    } catch (err) {
        console.error('[getDocumentInfo] Error:', err);
        throw err;
    }
};

const cropDocument = async (command) => {
    try {
        console.log("[cropDocument] Cropping document to selection.");

        if (!hasActiveSelection()) {
            throw new Error("[cropDocument] An active selection is required to crop the document.");
        }

        const doc = app.activeDocument;
        const originalDimensions = { width: doc.width, height: doc.height };

        await execute(async () => {
            const commands = [
                {
                    _obj: "crop",
                    delete: true,
                },
            ];
            await action.batchPlay(commands, {});
        });

        const newDimensions = { width: doc.width, height: doc.height };

        const result = {
            success: true,
            originalDimensions,
            newDimensions,
        };

        console.log("[cropDocument] Document cropped successfully.", result);
        return result;

    } catch (err) {
        console.error(`[cropDocument] Failed to crop document: ${err.message}`);
        throw err; // Re-throw to allow further handling up the chain
    }
};



const removeBackground = async (command) => {

    let options = command.options;
    let layerName = options.layerName;

    let layer = findLayer(layerName);

    if (!layer) {
        throw new Error(
            `removeBackground : Could not find layerName : ${layerName}`
        );
    }

    await execute(async () => {
        selectLayer(layer, true);

        let commands = [
            // Remove Background
            {
                _obj: "removeBackground",
            },
        ];

        await action.batchPlay(commands, {});
    });
};

const alignContent = async (command) => {
    try {
        const options = command.options;
        const { layerName, alignmentMode } = options;

        if (!layerName) {
            throw new Error("[alignContent] 'layerName' option is required.");
        }
        if (!alignmentMode) {
            throw new Error("[alignContent] 'alignmentMode' option is required.");
        }

        console.log(`[alignContent] Aligning layer "${layerName}" with mode "${alignmentMode}".`);

        const layer = findLayer(layerName);
        if (!layer) {
            throw new Error(`[alignContent] Could not find layer named: ${layerName}`);
        }

        if (!app.activeDocument || !app.activeDocument.selection.bounds) {
            throw new Error("[alignContent] An active selection is required.");
        }

        await execute(async () => {
            const mode = getAlignmentMode(alignmentMode);
            selectLayer(layer, true);

            const commands = [
                {
                    _obj: "align",
                    _target: [
                        {
                            _enum: "ordinal",
                            _ref: "layer",
                            _value: "targetEnum",
                        },
                    ],
                    alignToCanvas: false,
                    using: {
                        _enum: "alignDistributeSelector",
                        _value: mode,
                    },
                },
            ];
            await action.batchPlay(commands, {});
        });

        const result = {
            success: true,
            layerName,
            alignmentMode,
        };
        console.log("[alignContent] Alignment successful.", result);
        return result;

    } catch (err) {
        console.error(`[alignContent] Failed to align content: ${err.message}`);
        throw err;
    }
};

const generateImage = async (command) => {

    let options = command.options;

    await execute(async () => {
        //layer.selected = true
        let doc = app.activeDocument;
        await doc.selection.selectAll();
        let commands = [
            // Generate Image current document
            {
                _obj: "syntheticTextToImage",
                _target: [
                    {
                        _enum: "ordinal",
                        _ref: "document",
                        _value: "targetEnum",
                    },
                ],
                documentID: doc.id,
                layerID: 0,
                prompt: options.prompt,
                serviceID: "clio",
                serviceOptionsList: {
                    clio: {
                        _obj: "clio",
                        clio_advanced_options: {
                            text_to_image_styles_options: {
                                text_to_image_content_type: "none",
                                text_to_image_effects_count: 0,
                                text_to_image_effects_list: [
                                    "none",
                                    "none",
                                    "none",
                                ],
                            },
                        },
                        dualCrop: true,
                        gentech_workflow_name: "text_to_image",
                        gi_ADVANCED: '{"enable_mts":true}',
                        gi_CONTENT_PRESERVE: 0,
                        gi_CROP: false,
                        gi_DILATE: false,
                        gi_ENABLE_PROMPT_FILTER: true,
                        gi_GUIDANCE: 6,
                        gi_MODE: "ginp",
                        gi_NUM_STEPS: -1,
                        gi_PROMPT: options.prompt,
                        gi_SEED: -1,
                        gi_SIMILARITY: 0,
                    },
                },
                workflow: "text_to_image",
                workflowType: {
                    _enum: "genWorkflow",
                    _value: "text_to_image",
                },
            },
            // Rasterize current layer
            {
                _obj: "rasterizeLayer",
                _target: [
                    {
                        _enum: "ordinal",
                        _ref: "layer",
                        _value: "targetEnum",
                    },
                ],
            },
        ];
        await action.batchPlay(commands, {});

        let l = findLayer(options.prompt);
        l.name = options.layerName;
    });
};

const saveDocument = async (command) => {

    await execute(async () => {
        await app.activeDocument.save()
    });
};



const saveDocumentAs = async (command) => {
    let options = command.options

    return await _saveDocumentAs(options.filePath, options.fileType)
};

const createDocument = async (command) => {
    const options = command.options;
    // Parameter validation
    const requiredFields = ["width", "height", "resolution", "colorMode", "fillColor"];
    for (const field of requiredFields) {
        if (options[field] === undefined || options[field] === null) {
            throw new Error(`[createDocument] Missing required option: ${field}`);
        }
    }

    let colorMode, fillColor;
    try {
        colorMode = getNewDocumentMode(options.colorMode);
    } catch (e) {
        throw new Error(`[createDocument] Invalid colorMode: ${options.colorMode}`);
    }
    try {
        fillColor = parseColor(options.fillColor);
    } catch (e) {
        throw new Error(`[createDocument] Invalid fillColor: ${JSON.stringify(options.fillColor)}`);
    }

    await execute(async () => {
        try {
            console.log('[createDocument] Creating document with options:', options);
            await app.createDocument({
                typename: "DocumentCreateOptions",
                width: options.width,
                height: options.height,
                resolution: options.resolution,
                mode: colorMode,
                fill: constants.DocumentFill.COLOR,
                fillColor: fillColor,
                profile: "sRGB IEC61966-2.1",
            });

            // Ensure at least one layer exists
            const allLayers = app.activeDocument.layers;
            if (!allLayers || allLayers.length === 0) {
                throw new Error('[createDocument] No layers found after document creation');
            }

            // Try to find or create a background layer
            let background = findLayer("Background");
            if (!background) {
                background = allLayers[0];
                console.log('[createDocument] No "Background" layer found, using first layer:', background.name);
            }

            // Unlock and rename background layer
            try {
                if (background.allLocked) {
                    background.allLocked = false;
                    console.log('[createDocument] Unlocked background layer');
                }
            } catch (e) {
                console.warn('[createDocument] Could not unlock background layer:', e);
            }
            if (background.name !== "Background") {
                try {
                    background.name = "Background";
                    console.log('[createDocument] Renamed background layer to "Background"');
                } catch (e) {
                    if (e.message.includes("You cannot change the Background layer's name")) {
                        console.warn(`[createDocument] Could not rename layer to "Background": ${e.message}`);
                    } else {
                        throw e;
                    }
                }
            }

            // Final log
            console.log('[createDocument] Document created successfully.');
            return {
                width: options.width,
                height: options.height,
                resolution: options.resolution,
                colorMode: colorMode,
                backgroundLayer: background.name
            };
        } catch (err) {
            console.error('[createDocument] Error:', err);
            throw err;
        }
    });
};

const commandHandlers = {
    openFile,
    placeImage,
    getDocumentInfo,
    cropDocument,
    removeBackground,
    alignContent,
    // generateImage,
    saveDocument,
    saveDocumentAs,
    createDocument
};

module.exports = {
    commandHandlers
};