#!/usr/bin/env node
/**
 * 修复 files.json 中因编码问题导致的乱码文件名
 * 将 UTF-8 字节被错误解释为 Latin-1 的文件名恢复为正确的 UTF-8
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const FILES_DB = path.join(DATA_DIR, 'files.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

function fixEncoding(garbledName) {
  try {
    // 将乱码字符串（UTF-8 字节被解释为 Latin-1）转换回正确的 UTF-8
    const fixed = Buffer.from(garbledName, 'latin1').toString('utf8');
    // 检查是否包含替换字符，说明转换失败
    if (fixed.includes('\ufffd')) {
      return garbledName; // 转换失败，返回原名
    }
    return fixed;
  } catch (e) {
    return garbledName;
  }
}

function isGarbled(str) {
  // 检测是否包含典型的 Latin-1 误解码模式
  // 如 é 后跟非 ASCII 字符，或 å、æ、ç 等
  return /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ][^\s]{2,}/.test(str);
}

function main() {
  console.log('=== 修复乱码文件名 ===\n');

  if (!fs.existsSync(FILES_DB)) {
    console.log('files.json 不存在，跳过');
    return;
  }

  const filesDB = JSON.parse(fs.readFileSync(FILES_DB, 'utf8'));
  let fixedCount = 0;

  for (const file of filesDB) {
    const originalName = file.originalName;
    const storedName = file.storedName;

    // 修复 originalName
    if (isGarbled(originalName)) {
      const fixedOriginal = fixEncoding(originalName);
      if (fixedOriginal !== originalName) {
        console.log(`[originalName] ${originalName} → ${fixedOriginal}`);
        file.originalName = fixedOriginal;
        fixedCount++;
      }
    }

    // 修复 storedName（实际文件名）
    if (isGarbled(storedName)) {
      const fixedStored = fixEncoding(storedName);
      if (fixedStored !== storedName) {
        const oldPath = path.join(UPLOAD_DIR, storedName);
        const newPath = path.join(UPLOAD_DIR, fixedStored);

        // 重命名磁盘上的文件
        if (fs.existsSync(oldPath)) {
          try {
            fs.renameSync(oldPath, newPath);
            console.log(`[文件重命名] ${storedName} → ${fixedStored}`);
          } catch (e) {
            console.error(`[重命名失败] ${storedName}: ${e.message}`);
          }
        }

        file.storedName = fixedStored;
        fixedCount++;
      }
    }
  }

  if (fixedCount > 0) {
    fs.writeFileSync(FILES_DB, JSON.stringify(filesDB, null, 2));
    console.log(`\n✅ 修复完成，共修复 ${fixedCount} 个文件名`);
  } else {
    console.log('没有发现需要修复的乱码文件名');
  }
}

main();
