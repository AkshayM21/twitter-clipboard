function replaceUrlsWithLinks(text, links) {
  // captures URLs including ellipsis and common punctuation for trailing
  const urlRegex = /https?:\/\/[^\s]+(?:…)?/g;
  
  let linkIndex = 0;
  
  const result = text.replace(urlRegex, (match) => {
    if (linkIndex < links.length) {
      return links[linkIndex++];
    }
    return match;
  });
  
  return result;
}

// Reliable copy function that works from anywhere
function reliableCopy(text) {
    // Method 1: Try the textarea approach
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices
    
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.log('execCommand failed:', err);
    }
    
    document.body.removeChild(textArea);
    
    if (success) {
        console.log('✅ Text copied to clipboard using execCommand!');
        return true;
    }
    
    // Method 2: Try clipboard API as fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => {
            console.log('✅ Text copied to clipboard using Clipboard API!');
            return true;
        }).catch(err => {
            console.log('❌ Clipboard API failed:', err);
            return false;
        });
    }
    
    return false;
}


async function parseThread(){
    // Scroll to top first
    while(document.documentElement.scrollTop != 0){
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' 
        });
        await new Promise(r => setTimeout(r, 1000));
    }
    const url = window.location.href;
    const timestamp = new Date().toLocaleString();
    
    const extractedTexts = [];
    
    extractedTexts.push(`Thread from: ${url}\nCaptured: ${timestamp}\n`);
    const prevTexts = new Set([]);
    var endReached = false;
    var iters = 0;
    const maxIters = 5;

    while(!endReached && iters < maxIters){
        const showMoreButtons = document.querySelectorAll('button[data-testid="tweet-text-show-more-link"]');
        showMoreButtons.forEach(button => button.click());

        await new Promise(r => setTimeout(r, 500));

        const tweets = document.querySelector('div[aria-label="Timeline: Conversation"]').children[0].children;
        const numTweets = tweets.length;
        
        for(const [idx, tweet] of [...tweets].entries()){
            //check for multiple tweet texts (includes quote tweet then - loop on that)
            const usernames = tweet.querySelectorAll('div[data-testid="User-Name"]')
            const tweetBodies = tweet.querySelectorAll('div[data-testid="tweetText"]');
            //in default case length of tweetBodies =1, so this just runs once
            for(var i=0; i<tweetBodies.length; i++){
                var username = (i>0 ? "Quoted Tweet: " : "") + usernames[i].innerText.split("\n")[0];
                var tweetBody = tweetBodies[i];
                var textBody = tweetBody.innerText.trim().replace(/\s+/g, ' ');

                //get links
                const linkElements = tweetBody.querySelectorAll("a");
                const links = [];
                if (linkElements) {
                    linkElements.forEach((linkElement) => {
                        links.push(linkElement.href);
                    })
                }
                textBody = replaceUrlsWithLinks(textBody, links);

                if (tweet.querySelectorAll('div[data-testid="card.wrapper"]')){
                    tweet.querySelectorAll('div[data-testid="card.wrapper"]').forEach((card)=> {
                        textBody+="\n"+card.querySelectorAll("a")[0].href;
                    })
                }

                const entry = username + ": " + textBody;
                
                if(!prevTexts.has(entry)){
                    extractedTexts.push(entry);
                    prevTexts.add(entry);
                }

            }
        
        
            if(tweet.querySelector('div[data-testid="inline_reply_offscreen"]')){
                endReached = true;
                break;
            }
            
            if(idx == numTweets-1){
                tweet.scrollIntoView({ behavior: 'instant', block: 'start' });
                await new Promise(r => setTimeout(r, 500));
            }
        }
        iters++;
    }

    // Display results
    extractedTexts.forEach((tweet, index) => {
        console.log(`${index + 1}. ${tweet}`);
    });

    // Try to copy the results
    const allText = extractedTexts.join('\n');

    console.log('\n=== ATTEMPTING TO COPY ===');
    const copyResult = reliableCopy(allText);

    // If it returns a promise, handle it
    if (copyResult && copyResult.then) {
        copyResult.then(success => {
            if (!success) {
                console.log('\n❌ All copy methods failed. Here\'s your text:');
                console.log('='.repeat(60));
                console.log(allText);
                console.log('='.repeat(60));
                alert("Try copy again!");
                return false;
            }
        });
    } else if (!copyResult) {
        console.log('\n❌ Copy failed. Here\'s your text:');
        console.log('='.repeat(60));
        console.log(allText);
        console.log('='.repeat(60));
        alert("Try copy again!");
        return false;
    }
    return true;
}

// Make the function available globally for the content script
if (typeof window !== 'undefined') {
  window.parseThread = parseThread;
}