export default function sendFile(ev) {
    console.log(ev.target.files[0])
    let inputfiles = ev.target.files;
    let totalChunks = Math.ceil(inputfiles[0].size / chunkSize)
    let from = currentChunkIndex * chunkSize;
    let to = from + chunkSize;
    let blob = inputfiles[0].slice(from, to)
    console.log(totalChunks)
    console.log(inputfiles[0].slice(from, to))
    const filereader = new FileReader()
    filereader.readAsDataURL(blob)
    filereader.onload = () => {
      sendMessage(null, null, { name: ev.target.files[0].name, type: ev.target.files[0].type, isLastChunk: currentChunkIndex + 1 === totalChunks, file: filereader.result }).then(() => {
        if (currentChunkIndex + 1 === totalChunks) {
          currentChunkIndex = 0;
        } else {
          currentChunkIndex++;
          sendFile(ev)
        }
      })
    }
  }