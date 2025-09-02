// 获取DOM元素
const platformSelect = document.getElementById('platform');
const domainSelect = document.getElementById('domain');
const contentTextarea = document.getElementById('content');
const promptTextarea = document.getElementById('prompt');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');

// 生成提示词
function generatePrompt() {
    const platform = platformSelect.value;
    const domain = domainSelect.value;
    const content = contentTextarea.value;
    
    const platformStyles = {
        "公众号": "爆文写作要点\n- 结构：热点引入→总-分-总→实用建议\n- 语言：亲切自然，多用短句和网络语\n- 互动：设置2-3个提问，结尾留话题\n- SEO：标题15-25字含关键词\n- 字数：1500-3000字",
        "头条号": "爆文写作要点\n- 标题：用数字/疑问/对比/悬念元素\n- 内容：开头3行抛爆点，小标题分段\n- 技巧：多用感叹句和口语化表达\n- 流量：蹭热点，设置悬念和反转\n- 字数：800-2000字",
        "知乎": "爆文写作要点\n- 结构：直接回答→逻辑组织→总结建议\n- 专业：引用权威数据和个人经验\n- 互动：预设疑问解答，@知名答主\n- 深度：多角度分析+可执行方法论\n- 字数：1000-5000字",
        "微博": "爆文写作要点\n- 内容：金句开头，100-140字简洁\n- 语言：用网络热梗，轻松幽默\n- 互动：设话题标签#，@相关账号\n- 传播：蹭热搜，用对比/反转手法\n- 发布：选黄金时段，系列微博",
    };
    
    let prompt = `你是一名专业的【${domain}领域博主】，结合下面给的信息内容，写一篇【${platform}】文章，要求字数1300字左右。\n\n文章需满足【${platform}】平台风格：${platformStyles[platform]}\n\n${content}`;
    
    promptTextarea.value = prompt;
    return prompt;
}

// 复制提示词和内容
function copyToClipboard() {
    const prompt = promptTextarea.value;
    
    // 方法1: 使用现代Clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(prompt)
            .then(() => alert('已复制到剪贴板！'))
            .catch(err => {
                console.error('Clipboard API 复制失败:', err);
                fallbackCopyText(prompt); // 尝试备用方法
            });
    } else {
        fallbackCopyText(prompt); // 使用备用方法
    }
}

// 备用复制方法
function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('已复制到剪贴板！');
        } else {
            alert('复制失败，请手动复制文本');
        }
    } catch (err) {
        console.error('备用复制方法失败:', err);
        alert('复制失败，请手动复制文本');
    }
    
    document.body.removeChild(textarea);
}

// 事件监听
generateBtn.addEventListener('click', generatePrompt);
copyBtn.addEventListener('click', copyToClipboard);

// 初始化时生成一次提示词
generatePrompt();
