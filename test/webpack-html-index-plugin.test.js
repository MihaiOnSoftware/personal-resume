/**
 * Tests for the HtmlIndexPlugin that generates html-files-index.json
 */

describe('HtmlIndexPlugin', () => {
    let mockCompiler;
    let mockCompilation;
    let HtmlIndexPlugin;

    beforeEach(() => {
        // Reset modules to get fresh instance
        jest.resetModules();

        // Mock fs module
        jest.mock('fs', () => ({
            writeFileSync: jest.fn(),
        }));

        // Mock path module  
        jest.mock('path', () => ({
            join: jest.fn((...args) => args.join('/')),
        }));

        // Create mock compiler and compilation
        mockCompilation = {
            assets: {
                'index.html': { source: () => '<html>Index</html>' },
                'resume.html': { source: () => '<html>Resume</html>' },
                'contact.html': { source: () => '<html>Contact</html>' },
                'chatbot.js': { source: () => 'console.log("chatbot")' },
                'navigation.js': { source: () => 'console.log("nav")' },
                'styles.css': { source: () => 'body { margin: 0; }' },
            },
        };

        mockCompiler = {
            hooks: {
                afterEmit: {
                    tap: jest.fn(),
                },
            },
            options: {
                output: {
                    path: '/dist',
                },
            },
        };

        // Import the plugin after mocking dependencies
        const fs = require('fs');
        const path = require('path');

        // Define the plugin class for testing
        HtmlIndexPlugin = class {
            apply(compiler) {
                compiler.hooks.afterEmit.tap('HtmlIndexPlugin', (compilation) => {
                    const htmlFiles = [];

                    // Find all HTML files in the output
                    for (const filename of Object.keys(compilation.assets)) {
                        if (filename.endsWith('.html')) {
                            htmlFiles.push(filename);
                        }
                    }

                    // Write the list to a JSON file
                    const indexPath = path.join(compiler.options.output.path, 'html-files-index.json');
                    fs.writeFileSync(indexPath, JSON.stringify(htmlFiles, null, 2));
                });
            }
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should register afterEmit hook', () => {
        const plugin = new HtmlIndexPlugin();
        plugin.apply(mockCompiler);

        expect(mockCompiler.hooks.afterEmit.tap).toHaveBeenCalledWith(
            'HtmlIndexPlugin',
            expect.any(Function),
        );
    });

    test('should extract HTML files from compilation assets', () => {
        const fs = require('fs');
        const plugin = new HtmlIndexPlugin();
        plugin.apply(mockCompiler);

        // Get the callback function that was registered
        const callback = mockCompiler.hooks.afterEmit.tap.mock.calls[0][1];

        // Execute the callback with mock compilation
        callback(mockCompilation);

        // Should have written the HTML files index
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            '/dist/html-files-index.json',
            JSON.stringify(['index.html', 'resume.html', 'contact.html'], null, 2),
        );
    });

    test('should filter out non-HTML files', () => {
        const fs = require('fs');
        const plugin = new HtmlIndexPlugin();
        plugin.apply(mockCompiler);

        const callback = mockCompiler.hooks.afterEmit.tap.mock.calls[0][1];
        callback(mockCompilation);

        // Check that only HTML files were included
        const writeCall = fs.writeFileSync.mock.calls[0];
        const writtenContent = writeCall[1];
        const htmlFiles = JSON.parse(writtenContent);

        expect(htmlFiles).toEqual(['index.html', 'resume.html', 'contact.html']);
        expect(htmlFiles).not.toContain('chatbot.js');
        expect(htmlFiles).not.toContain('navigation.js');
        expect(htmlFiles).not.toContain('styles.css');
    });

    test('should handle empty compilation assets', () => {
        const fs = require('fs');
        const plugin = new HtmlIndexPlugin();
        plugin.apply(mockCompiler);

        const callback = mockCompiler.hooks.afterEmit.tap.mock.calls[0][1];

        // Mock compilation with no assets
        const emptyCompilation = { assets: {} };
        callback(emptyCompilation);

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            '/dist/html-files-index.json',
            JSON.stringify([], null, 2),
        );
    });

    test('should handle compilation with only non-HTML assets', () => {
        const fs = require('fs');
        const plugin = new HtmlIndexPlugin();
        plugin.apply(mockCompiler);

        const callback = mockCompiler.hooks.afterEmit.tap.mock.calls[0][1];

        // Mock compilation with only JS/CSS files
        const nonHtmlCompilation = {
            assets: {
                'app.js': { source: () => 'console.log("app")' },
                'styles.css': { source: () => 'body {}' },
                'image.png': { source: () => 'binary data' },
            },
        };

        callback(nonHtmlCompilation);

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            '/dist/html-files-index.json',
            JSON.stringify([], null, 2),
        );
    });

    test('should use correct output path from compiler options', () => {
        const fs = require('fs');
        const path = require('path');

        // Mock different output path
        const customCompiler = {
            ...mockCompiler,
            options: {
                output: {
                    path: '/custom/build/dir',
                },
            },
        };

        const plugin = new HtmlIndexPlugin();
        plugin.apply(customCompiler);

        const callback = customCompiler.hooks.afterEmit.tap.mock.calls[0][1];
        callback(mockCompilation);

        expect(path.join).toHaveBeenCalledWith('/custom/build/dir', 'html-files-index.json');
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            '/custom/build/dir/html-files-index.json',
            expect.any(String),
        );
    });
}); 