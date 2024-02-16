'use client'
import { useState, useEffect, useCallback } from 'react'
const pangu = require('pangu')

// 自定义防抖 Hook
function useDebounce(value: any, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}

export default function Home() {
	// Define a helper function to read a value from local storage
	const readLocalStorage = (key: string, defaultValue: any) => {
		if (typeof window !== 'undefined') {
			const storedValue = window.localStorage.getItem(key)
			return storedValue !== null ? JSON.parse(storedValue) : defaultValue
		}
		return defaultValue
	}

	const [inputText, setInputText] = useState('')
	const [outputText, setOutputText] = useState('')
	const [useFullWidthPunctuation, setUseFullWidthPunctuation] = useState(() =>
		readLocalStorage('useFullWidthPunctuation', true)
	)
	const [removeNewLines, setRemoveNewLines] = useState(() => readLocalStorage('removeNewLines', false))
	const [autoNewlineAfterPeriod, setAutoNewlineAfterPeriod] = useState(() =>
		readLocalStorage('autoNewlineAfterPeriod', false)
	)
	const [removeSpacesBetweenChinese, setRemoveSpacesBetweenChinese] = useState(() =>
		readLocalStorage('removeSpacesBetweenChinese', true)
	)
	const [addSpaceBetweenCNEng, setAddSpaceBetweenCNEng] = useState(() =>
		readLocalStorage('addSpaceBetweenCNEng', true)
	)
	const [isMarkdownToEmojiEnabled, setIsMarkdownToEmojiEnabled] = useState(() =>
		readLocalStorage('isMarkdownToEmojiEnabled', false)
	)

	// Function to count the words in inputText
	const countWords = (text: string) => {
		return text.length
	}

	const markdownToEmoji = (markdownText: string) => {
		let formattedText = markdownText

		// Replace empty lines with a dash (or hyphen)
		// formattedText = formattedText.replace(/^\s*$(?:\r\n?|\n)/gm, '-\n')

		// Replace markdown headers (####, ###, ##, #) with corresponding emojis and ensure newline is preserved
    formattedText = formattedText.replace(/^#### (.*?)(\r?\n|\r)/gm, '🔹 $1\n'); // Level 4 Header
    formattedText = formattedText.replace(/^### (.*?)(\r?\n|\r)/gm, '🔸 $1\n');  // Level 3 Header
    formattedText = formattedText.replace(/^## (.*?)(\r?\n|\r)/gm, '⭐ $1\n');   // Level 2 Header
    formattedText = formattedText.replace(/^# (.*?)(\r?\n|\r)/gm, '🌟 $1\n');    // Level 1 Header
  
		// Replace markdown ordered lists with emoji numbers
		formattedText = formattedText.replace(/^(\d+)\. (.*)$/gim, (match, p1, p2) => {
			const number = parseInt(p1, 10)
			// Create emoji number based on the digit (limited to 1-9 for this example)
			const emojiNumbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
			const numberEmoji = emojiNumbers[number] || number
			return `${numberEmoji} ${p2}`
		})

		// Replace markdown bold syntax with strong emoji (💪)
		formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '💪 $1')

		// Replace markdown italic syntax with emphasis emoji (✨)
		formattedText = formattedText.replace(/\*(.*?)\*/g, '✨ $1')

		// Replace markdown links with link emoji (🔗)
		formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '🔗 [$1]($2)')

		// Replace markdown unordered list items with bullet emoji (🔘)
		formattedText = formattedText.replace(/^\s*-\s(.*)$/gim, '🔘 $1')

		return formattedText
	}

	// 使用自定义的防抖 Hook
	const debouncedInputText = useDebounce(inputText, 300) // 防抖延迟设置为 500 毫秒

	const formatText = useCallback(() => {
		let formattedText = debouncedInputText

		if (isMarkdownToEmojiEnabled) {
			formattedText = markdownToEmoji(formattedText)
		}

		// Convert to full-width punctuation
		if (useFullWidthPunctuation) {
			formattedText = formattedText
				.replace(/,/g, '，')
				.replace(/\./g, '。')
				.replace(/\?/g, '？')
				.replace(/!/g, '！')
		}

		// Remove all new lines
		if (removeNewLines) {
			formattedText = formattedText.replace(/\r?\n|\r/g, '')
		}

		// Auto newline after period
		if (autoNewlineAfterPeriod) {
			formattedText = formattedText.replace(/。\s*/g, '。\n')
		}

		// Clean spaces between Chinese characters
		if (removeSpacesBetweenChinese) {
			formattedText = formattedText.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2')
		}

		// Add space between Chinese and English
		if (addSpaceBetweenCNEng) {
			formattedText = pangu.spacing(formattedText)
		}

		setOutputText(formattedText)
	}, [
		debouncedInputText,
		useFullWidthPunctuation,
		removeNewLines,
		autoNewlineAfterPeriod,
		removeSpacesBetweenChinese,
		addSpaceBetweenCNEng,
		isMarkdownToEmojiEnabled,
	])

	// Use useEffect to update local storage and format text whenever the dependencies change
	useEffect(() => {
		formatText()
		window.localStorage.setItem('useFullWidthPunctuation', JSON.stringify(useFullWidthPunctuation))
		window.localStorage.setItem('removeNewLines', JSON.stringify(removeNewLines))
		window.localStorage.setItem('autoNewlineAfterPeriod', JSON.stringify(autoNewlineAfterPeriod))
		window.localStorage.setItem('removeSpacesBetweenChinese', JSON.stringify(removeSpacesBetweenChinese))
		window.localStorage.setItem('addSpaceBetweenCNEng', JSON.stringify(addSpaceBetweenCNEng))
		window.localStorage.setItem('isMarkdownToEmojiEnabled', JSON.stringify(isMarkdownToEmojiEnabled))
	}, [
		addSpaceBetweenCNEng,
		autoNewlineAfterPeriod,
		formatText,
		removeNewLines,
		removeSpacesBetweenChinese,
		useFullWidthPunctuation,
		isMarkdownToEmojiEnabled,
	])

	return (
		<div className="container mx-auto p-12 min-h-screen">
			<div>
				<textarea
					className="w-full p-2 border border-gray-300 rounded"
					rows={10}
					placeholder="Enter text here..."
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					autoCapitalize="true"
				/>
				<p className="text-right text-sm text-gray-600">Word Count: {countWords(inputText)}</p>
			</div>
			<div className="flex flex-col my-4 space-y-4">
				<label>
					<input
						type="checkbox"
						checked={useFullWidthPunctuation}
						onChange={() => setUseFullWidthPunctuation(!useFullWidthPunctuation)}
					/>
					全角标点转换：将逗号、句号、问号和感叹号转换为全角形式，以获得东亚文本的统一外观。
				</label>
				<label>
					<input
						type="checkbox"
						checked={removeNewLines}
						onChange={() => setRemoveNewLines(!removeNewLines)}
					/>
					删除新行：通过消除所有新行来清理文本，使文本更易于处理或阅读。
				</label>
				<label>
					<input
						type="checkbox"
						checked={autoNewlineAfterPeriod}
						onChange={() => setAutoNewlineAfterPeriod(!autoNewlineAfterPeriod)}
					/>
					句号后自动换行：在每个句号后自动换行，通过清晰分隔句子来提高可读性。
				</label>
				<label>
					<input
						type="checkbox"
						checked={removeSpacesBetweenChinese}
						onChange={() => setRemoveSpacesBetweenChinese(!removeSpacesBetweenChinese)}
					/>
					删除汉字之间的空格：通过删除字符之间不必要的空格来整理中文文本的外观。
				</label>
				<label>
					<input
						type="checkbox"
						checked={addSpaceBetweenCNEng}
						onChange={() => setAddSpaceBetweenCNEng(!addSpaceBetweenCNEng)}
					/>
					在中英文之间添加空格：在中文字符和英文字母或数字之间添加空格，按照双语文本格式化的最佳实践改善清晰度。
				</label>
				<label>
					<input
						type="checkbox"
						checked={isMarkdownToEmojiEnabled}
						onChange={() => setIsMarkdownToEmojiEnabled(!isMarkdownToEmojiEnabled)}
					/>
					启用 Markdown 转 Emoji
				</label>
			</div>
			<div>
				<textarea
					className="w-full p-2 border border-gray-300 rounded"
					rows={10}
					placeholder="Formatted text will appear here..."
					value={outputText}
					readOnly
				/>
				<p className="text-right text-sm text-gray-600">Word Count: {countWords(outputText)}</p>
			</div>
			<div className="introduction">
				<h1 className="text-2xl font-bold mb-4">欢迎使用高级文本格式化工具！</h1>
				<p>
					我们的高级文本格式化工具旨在满足您处理文本的各种需求，无论您是在创建内容、编程还是整理笔记。通过直观的界面和强大的功能，您可以轻松地对文本进行格式化，以满足不同的风格和结构要求。
				</p>
				<p>
					感谢本地存储的集成，您的所有偏好设置都将被记住，以便下次访问时使用。您上次使用的设置将保持原样，为您节省时间和精力。
				</p>
				<p>
					要开始格式化，只需在提供的框中输入您的文本，根据需要调整格式化选项，然后点击“格式化文本”按钮。您的格式化文本将出现在指定区域，随时可以使用。
				</p>
				<p>立即使用我们的高级文本格式化工具提升您的文本格式化体验！</p>
			</div>
		</div>
	)
}
