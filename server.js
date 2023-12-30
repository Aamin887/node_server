const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const fsPromise = require('fs').promises;
const http = require('http');
const eventLogger = require('./eventLogger')

//initial event
class Emitter extends  EventEmitter{};
// create instant
const myEmitter = new Emitter();

myEmitter.on('log', (message, fileName) => eventLogger(message, fileName))

const PORT = process.env.PORT || 3500;

const serveFile = async function(filePath, contentType, response){
    try {
        const rawData = await fsPromise.readFile(
            filePath, 
            !contentType.includes('image') ? 'utf8' : ''
            );

        const data = contentType === 'application/json' ? JSON.parse(rawData) : rawData;

        response.writeHead(
            filePath.includes('404.html') ? 404 : 200,
            {'Content-Type': contentType}
        );

        response.end(contentType === 'application/json' ? JSON.stringify(data) : data);
    } catch (err) {
        console.log(err);
        response.statusCode = 500;
        myEmitter.emit('log', `${err.name} ${err.message}`, 'errLog.log')
        response.end();
    }
}

const server = http.createServer((req, res) => {

    myEmitter.emit('log', `${req.url}\t${req.method}`, 'requestLogger.log')

    let contentType;
    let fileExtension = path.extname(req.url);

    switch(fileExtension){
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        case '.jpeg':
            contentType = 'image/jpeg';
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        default:
            contentType = 'text/html'
    }


    let filePath = contentType === 'text/html' && req.url === '/'
                    ? path.join(__dirname, 'views', 'index.html') 
                    : contentType === 'text/html' && req.url.slice(-1) === '/'
                        ? path.join(__dirname, 'views', req.url, 'index.html')
                        : contentType === 'text/html'
                            ? path.join(__dirname, 'views' , req.url)
                            : path.join(__dirname, req.url)

    if(!fileExtension && req.url.slice(-1) !== '/') filePath += '.html';

    const fileExist = fs.existsSync(filePath)

    if(fileExist){
        serveFile(filePath, contentType, res);
    }else{
        switch(path.parse(filePath).base){
            case 'old-page.html' || 'outdate-page.html': 
                res.writeHead(301, {'location': '/new-page.html'});
                res.end();
                break;
            case 'www-page-x.html': 
                res.writeHead(301, {'location': '/'});
                res.end();
                break;
            default: 
                serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res)
        }
    }

});


server.listen(PORT, () => console.log(`Server is active on PORT: ${PORT}`))