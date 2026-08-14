---
title: "پروژ‌ه‌ی clipdex"
summary: "نیاز بود که بخش‌هایی از یک دوره‌ای رو ببینم. دوره‌ای ویدیو‌ای و طولانی که مشخص نبود هر سرفصل توی کدوم فصل و توی کدوم بازه‌ی زمانی توضیح داده شده. یک ابزار نوشتم که این اطلاعات رو از دوره استخراج کنه."
date: "2026-08-14"
categories: ["Programming"]
keywords: ["clipdex", "linux kernel internals", "video topic extraction", "video course navigation", "ai video indexing", "abolfazl kazemi", "linux forensics course", "video content search", "whisper transcript", "long video analysis"]
image: "/media/posts/img_1786740342674_hj83e.png"
---

سلام.

می‌خواستم که بخش‌هایی از Linux Kernel Internals رو دوره کنم. از قبل می‌دونستم که [ابوالفضل کاظمی](https://www.linkedin.com/in/akazemi67/)، دورهایی رو توی یو‌تیوب داره: [کانال os_security](https://www.youtube.com/@os_security). رفتم سری به کانالش زدم و متوجه شدم که دوره‌ی لینوکس اینترنالی که گذاشته کامل نیست و خودش بخشی از دوره‌ی Linux Internals and Forensicsـه که اون هم توی هیچ‌کدوم از پلتفرم‌ها منتشر نشده. به ایشون پیام دادم و ماجرا رو گفتم. توضیح دادن که فایل‌های این دوره رو توی یک کانال تلگرامی گذاشتن. [از اینجا](https://t.me/akazemi67_courses) می‌تونین شما هم دانلود کنین.

نکته اما این بود که دوره مفصل بود و محور اصلی دوره هم فارنزیک بود و من فقط دنبال بخش‌هایی از اون دوره بودم که تماشا کنم. ولی مشکل این بود که پیدا کردن سرفصل‌ها بین این همه فایل ویدیو‌ای (۱۳ فصل هر کدوم دو فایل) و فایل‌های طولانی (هر فایل حدودا ۱ و نیم‌ساعت) به صورت دستی کار سختی بود برای همین تصمیم گرفتم ابزاری بنویسم که این رو برای من آماده کنه. 

از Grok 4.6 که یک روزی از زمان انتشارش گذشته استفاده کردم. الگوریتمی هم که برای انجام این کار داشتم ساده بود:
- استخراج transcribe هر ویدیو با یکی از مدل‌هایی تبدیل صوت به متن که از فارسی هم ساپورت کنه (mlx-whisper یا openai-whisper)
- دادن متن‌ها به همراه تایم استمپ به یکی از LLMها برای تفکیک تاپیک‌ها
- نمایش سرفصل‌ها یا تاپیک‌ها به همراه زمانشون به طوری که قابل کلیک باشن و پلیر به همون زمان که ابتدای مبحث می‌شه seek کنه. 

نتیجه‌ی این ماجرا شد پروژه‌ی ‌Clipdex.  خودم از نتیجه‌ی پروژه راضی بودم و برای همین دوست داشتم که اون رو منتشر هم بکنم. احتمالا بدرد بقیه هم بخوره. [از اینجا می‌تونین پروژه رو بررسی کنین](https://github.com/alirezaazadi/clipdex) و اگر دوست داشتید هم استفاده کنین. اگر به مشکلی هم برخوردین یا پیشنهادی برای بهتر کردنش یا توسعه‌ش هم داشتید ایشو باز کنین. خوش‌حال می‌شم که بررسی کنم. 


![Image](/media/posts/clipdex/img_1786741273958_hjb3o.jpg)

![Image](/media/posts/clipdex/img_1786741273973_oe69o.jpg)

![Image](/media/posts/clipdex/img_1786741273984_i5wd7.jpg)

![Image](/media/posts/clipdex/img_1786741273996_kzusr.jpg)

پی‌نوشت: خروجی زمان‌بندی دوره رو هم اینجا می‌ذارم. اگر نخواستید پروژه رو ران کنین، حداقل بتونین از این استفاده کنین:
```
# linux internal forensics topics index

55 topics · 137 clips

## Topics

### /proc filesystem

- /proc filesystem · Session 01 · S01-P1.mp4 · `00:42:15` – `00:52:22`

### Assembly

- x86 registers and flags · Session 01 · S01-P2.mp4 · `00:09:45` – `00:23:58`
- Assembly instructions · Session 01 · S01-P2.mp4 · `00:23:58` – `00:38:58`

### Bash history

- Bash history · Session 09 · S09-P2.mp4 · `00:12:29` – `00:28:02`

### bpftrace

- bpftrace · Session 07 · S07-P1.mp4 · `00:47:42` – `00:57:18`

### bulk_extractor

- bulk_extractor · Session 09 · S09-P1.mp4 · `00:38:57` – `00:46:59`

### Calling convention

- 32-bit calling convention · Session 01 · S01-P2.mp4 · `00:38:58` – `01:18:16`
- Stack frames · Session 02 · S02-P1.mp4 · `00:00:00` – `00:27:23`
- x64 calling convention · Session 02 · S02-P2.mp4 · `00:11:57` – `00:25:01`

### Case studies

- Apache honeypot case · Session 13 · S13-P1.mp4 · `01:04:57` – `01:27:18`
- icat file recovery · Session 13 · S13-P2.mp4 · `00:00:00` – `00:07:41`
- Process environment pivoting · Session 13 · S13-P2.mp4 · `00:07:41` – `00:21:16`
- Apache log analysis · Session 13 · S13-P2.mp4 · `00:21:16` – `00:43:17`

### Copy-on-write

- Copy-on-write · Session 12 · S12-P2.mp4 · `00:44:56` – `00:51:28`

### Course intro and syllabus

- Course intro and syllabus · Session 01 · S01-P1.mp4 · `00:00:00` – `00:10:59`

### Digital forensics

- Digital forensics · Session 08 · S08-P1.mp4 · `00:00:00` – `00:22:35`

### Disk imaging

- dd disk imaging · Session 12 · S12-P1.mp4 · `00:15:23` – `00:40:38`
- Mounting disk images · Session 12 · S12-P1.mp4 · `00:40:38` – `00:47:59`

### Disk partitions

- Master boot record · Session 11 · S11-P2.mp4 · `00:51:41` – `01:12:30`
- MBR partition table · Session 12 · S12-P1.mp4 · `00:00:00` – `00:15:23`
- Extended partitions · Session 12 · S12-P1.mp4 · `00:47:59` – `00:53:32`
- GPT partition layout · Session 12 · S12-P1.mp4 · `01:11:51` – `01:19:12`
- GPT partition parsing · Session 12 · S12-P2.mp4 · `00:00:00` – `00:12:15`

### eBPF

- eBPF · Session 07 · S07-P1.mp4 · `00:41:08` – `00:47:42`

### ELF format

- Compilation pipeline and ELF · Session 01 · S01-P1.mp4 · `00:10:59` – `00:27:47`
- ELF overview · Session 11 · S11-P1.mp4 · `00:00:00` – `00:13:45`
- ELF header · Session 11 · S11-P1.mp4 · `00:13:45` – `00:26:54`
- Entry point · Session 11 · S11-P1.mp4 · `00:26:54` – `00:32:25`
- Program headers · Session 11 · S11-P1.mp4 · `00:32:25` – `00:49:57`
- Segment types · Session 11 · S11-P1.mp4 · `00:49:57` – `01:12:57`
- Section headers · Session 11 · S11-P1.mp4 · `01:12:57` – `01:21:26`
- Section headers · Session 11 · S11-P2.mp4 · `00:00:00` – `00:13:37`
- Section types · Session 11 · S11-P2.mp4 · `00:13:37` – `00:26:53`
- Dynamic linking · Session 11 · S11-P2.mp4 · `00:26:53` – `00:32:41`
- PLT and GOT · Session 11 · S11-P2.mp4 · `00:32:41` – `00:51:41`

### Encrypted containers

- Encrypted containers · Session 09 · S09-P1.mp4 · `00:46:59` – `01:01:08`

### Endianness

- Endianness · Session 01 · S01-P1.mp4 · `01:18:50` – `01:30:46`

### ext4

- ext filesystem blocks · Session 12 · S12-P2.mp4 · `00:51:28` – `01:03:15`
- ext4 on-disk layout · Session 13 · S13-P1.mp4 · `00:00:00` – `00:12:15`
- ext4 block groups · Session 13 · S13-P1.mp4 · `00:12:15` – `00:23:47`
- ext4 superblock · Session 13 · S13-P1.mp4 · `00:23:47` – `00:42:35`
- Inode number gaps · Session 13 · S13-P1.mp4 · `00:42:35` – `00:49:41`

### File integrity checks

- File integrity checks · Session 06 · S06-P1.mp4 · `00:00:00` – `00:09:25`

### Firefox history

- Firefox history · Session 09 · S09-P2.mp4 · `00:43:46` – `00:53:35`

### ftrace

- ftrace · Session 05 · S05-P2.mp4 · `00:26:52` – `00:42:00`
- function_graph · Session 05 · S05-P2.mp4 · `00:42:00` – `01:01:12`
- ftrace events · Session 05 · S05-P2.mp4 · `01:01:12` – `01:16:15`
- VFS ftrace recap · Session 06 · S06-P1.mp4 · `00:09:25` – `00:16:51`
- ftrace hooks · Session 06 · S06-P1.mp4 · `00:16:51` – `00:42:46`

### GDB

- GDB · Session 01 · S01-P1.mp4 · `00:52:22` – `01:18:50`

### GDB extensions

- GDB extensions · Session 01 · S01-P2.mp4 · `00:00:00` – `00:09:45`

### Incident response

- Incident response · Session 08 · S08-P1.mp4 · `00:22:35` – `00:32:07`

### IPC

- IPC · Session 06 · S06-P2.mp4 · `00:47:45` – `00:57:19`

### Journaling

- Journaling · Session 12 · S12-P2.mp4 · `00:39:00` – `00:44:56`

### Kernel build

- Kernel config and build · Session 02 · S02-P2.mp4 · `00:56:35` – `01:10:18`
- Booting custom kernel · Session 02 · S02-P2.mp4 · `01:10:18` – `01:16:30`
- Kernel config and build · Session 03 · S03-P1.mp4 · `00:24:43` – `01:05:42`
- Kernel GDB symbols · Session 03 · S03-P1.mp4 · `01:17:44` – `01:25:35`

### Kernel modules

- Kernel modules · Session 04 · S04-P2.mp4 · `00:00:00` – `00:09:10`
- Hello kernel module · Session 04 · S04-P2.mp4 · `00:09:10` – `00:29:20`
- EXPORT_SYMBOL · Session 04 · S04-P2.mp4 · `00:34:06` – `00:46:02`
- procfs module · Session 05 · S05-P2.mp4 · `00:11:28` – `00:26:52`
- Hidden kernel modules · Session 09 · S09-P1.mp4 · `00:27:20` – `00:38:57`

### Kernel source browsing

- Kernel source browsing · Session 02 · S02-P2.mp4 · `00:45:13` – `00:56:35`

### Kernel threads

- systemd · Session 07 · S07-P1.mp4 · `00:57:18` – `01:16:50`
- PID 1 boot · Session 07 · S07-P2.mp4 · `00:00:00` – `00:08:31`
- Kernel threads · Session 07 · S07-P2.mp4 · `00:08:31` – `01:05:24`

### Linux filesystem types

- Linux filesystem types · Session 12 · S12-P2.mp4 · `00:34:28` – `00:39:00`

### Linux kernel intro

- Linux kernel intro · Session 02 · S02-P2.mp4 · `00:25:01` – `00:45:13`

### Linux malware

- Symbiote · Session 13 · S13-P2.mp4 · `00:43:17` – `00:48:47`
- BPFDoor · Session 13 · S13-P2.mp4 · `00:48:47` – `00:56:13`

### Live forensics

- Live investigation · Session 08 · S08-P1.mp4 · `00:32:07` – `00:41:40`
- netcat transfer · Session 08 · S08-P1.mp4 · `00:41:40` – `00:50:54`
- Logger scripts · Session 08 · S08-P1.mp4 · `00:50:54` – `01:18:57`
- Sample log analysis · Session 08 · S08-P2.mp4 · `00:00:00` – `00:16:52`
- Live investigation · Session 08 · S08-P2.mp4 · `00:16:52` – `00:28:38`
- Live investigation · Session 09 · S09-P1.mp4 · `00:00:00` – `00:06:41`

### Memory corruption

- Section permissions and W^X · Session 01 · S01-P1.mp4 · `00:34:19` – `00:42:15`
- Format string vulnerability · Session 02 · S02-P1.mp4 · `00:27:23` – `00:36:54`
- Compiler mitigations · Session 02 · S02-P1.mp4 · `00:36:54` – `00:47:04`
- PIE and ASLR · Session 02 · S02-P1.mp4 · `00:47:04` – `01:04:35`
- Out-of-bounds write · Session 02 · S02-P1.mp4 · `01:04:35` – `01:27:04`
- Stack buffer overflow · Session 02 · S02-P2.mp4 · `00:00:00` – `00:11:57`

### Memory forensics

- Memory acquisition · Session 08 · S08-P2.mp4 · `00:28:38` – `00:36:23`
- LiME · Session 08 · S08-P2.mp4 · `00:36:23` – `00:46:19`
- Volatility profiles · Session 08 · S08-P2.mp4 · `00:46:19` – `01:09:50`
- Volatility 3 ISF · Session 09 · S09-P1.mp4 · `00:06:41` – `00:27:20`
- MemProcFS · Session 10 · S10.mp4 · `00:00:00` – `00:13:58`

### OOM killer

- OOM killer · Session 07 · S07-P2.mp4 · `01:05:24` – `01:13:47`

### Open files

- Open files · Session 09 · S09-P2.mp4 · `00:28:02` – `00:43:46`

### POSIX shared memory

- POSIX shared memory · Session 06 · S06-P2.mp4 · `00:57:19` – `01:11:54`

### Process sandboxing

- Process sandboxing · Session 07 · S07-P1.mp4 · `00:08:17` – `00:12:34`

### Processes

- task_struct · Session 05 · S05-P1.mp4 · `00:50:39` – `01:04:08`
- fork and clone · Session 05 · S05-P1.mp4 · `01:04:08` – `01:22:46`
- Task linked list · Session 05 · S05-P2.mp4 · `00:00:00` – `00:11:28`
- Signal handling · Session 06 · S06-P1.mp4 · `00:42:46` – `00:53:18`
- Process states · Session 06 · S06-P1.mp4 · `00:53:18` – `01:01:13`
- Zombie processes · Session 06 · S06-P1.mp4 · `01:01:13` – `01:20:00`

### pslist and psenv

- pslist and psenv · Session 09 · S09-P2.mp4 · `00:00:00` – `00:12:29`

### QEMU lab

- QEMU virtio disk · Session 03 · S03-P1.mp4 · `01:05:42` – `01:17:44`
- QEMU tap networking · Session 03 · S03-P2.mp4 · `00:00:00` – `00:10:29`

### Scheduling

- Task scheduling · Session 06 · S06-P2.mp4 · `00:00:00` – `00:10:36`
- Scheduling policies · Session 06 · S06-P2.mp4 · `00:10:36` – `00:18:17`
- task_struct priorities · Session 06 · S06-P2.mp4 · `00:18:17` – `00:47:45`
- Per-CPU runqueues · Session 07 · S07-P1.mp4 · `00:00:00` – `00:08:17`

### seccomp

- seccomp · Session 07 · S07-P1.mp4 · `00:12:34` – `00:41:08`

### setuid binary

- setuid binary · Session 09 · S09-P2.mp4 · `01:03:51` – `01:07:25`

### sk_buff packets

- sk_buff packets · Session 09 · S09-P1.mp4 · `01:01:08` – `01:11:34`

### Syscalls

- strace and ltrace · Session 03 · S03-P2.mp4 · `00:10:29` – `00:19:14`
- Syscall ABI · Session 03 · S03-P2.mp4 · `00:42:45` – `00:49:26`
- Assembly syscalls · Session 03 · S03-P2.mp4 · `00:49:26` – `01:06:55`
- Syscall recap · Session 04 · S04-P1.mp4 · `00:00:00` – `00:13:26`
- stat syscalls · Session 04 · S04-P1.mp4 · `00:13:26` – `00:32:03`
- Syscall ABI · Session 04 · S04-P1.mp4 · `00:32:03` – `00:51:29`
- sys_call_table · Session 04 · S04-P1.mp4 · `00:51:29` – `01:16:10`
- vdso and vsyscall · Session 04 · S04-P1.mp4 · `01:16:10` – `01:25:27`

### The Sleuth Kit

- The Sleuth Kit · Session 13 · S13-P1.mp4 · `00:49:41` – `00:58:38`

### TrueCrypt passphrase

- TrueCrypt passphrase · Session 09 · S09-P2.mp4 · `00:58:34` – `01:03:51`

### UAC collector

- UAC collector · Session 13 · S13-P1.mp4 · `00:58:38` – `01:04:57`

### UEFI Secure Boot

- UEFI Secure Boot · Session 12 · S12-P1.mp4 · `00:53:32` – `01:11:51`

### USB mount timeline

- USB mount timeline · Session 09 · S09-P2.mp4 · `00:53:35` – `00:58:34`

### User activity reconstruction

- User activity reconstruction · Session 09 · S09-P1.mp4 · `01:11:34` – `01:18:00`

### VFS

- File descriptors · Session 03 · S03-P2.mp4 · `00:19:14` – `00:42:45`
- Loop device · Session 04 · S04-P2.mp4 · `00:29:20` – `00:34:06`
- VFS · Session 05 · S05-P1.mp4 · `00:00:00` – `00:27:25`
- Major and minor numbers · Session 05 · S05-P1.mp4 · `00:27:25` – `00:35:23`
- dentry and inode · Session 05 · S05-P1.mp4 · `00:35:23` – `00:50:39`
- VFS · Session 12 · S12-P2.mp4 · `00:12:15` – `00:34:28`

### Virtual memory

- Process memory layout · Session 01 · S01-P1.mp4 · `00:27:47` – `00:34:19`
- Address space layout · Session 03 · S03-P1.mp4 · `00:00:00` – `00:24:43`
- Virtual address space · Session 10 · S10.mp4 · `00:13:58` – `00:28:41`
- Physical memory layout · Session 10 · S10.mp4 · `00:28:41` – `00:34:40`
- Pages and frames · Session 10 · S10.mp4 · `00:34:40` – `00:45:40`
- Page faults · Session 10 · S10.mp4 · `00:45:40` – `01:01:43`
- Memory zones · Session 10 · S10.mp4 · `01:01:43` – `01:15:27`
- Buddy and slab · Session 10 · S10.mp4 · `01:15:27` – `01:24:05`
- kmalloc and vmalloc · Session 10 · S10.mp4 · `01:24:05` – `01:46:19`

## Sessions

### Session 01

- `00:00:00` – `00:10:59` · S01-P1.mp4 — Course intro and syllabus
- `00:10:59` – `00:27:47` · S01-P1.mp4 — Compilation pipeline and ELF
- `00:27:47` – `00:34:19` · S01-P1.mp4 — Process memory layout
- `00:34:19` – `00:42:15` · S01-P1.mp4 — Section permissions and W^X
- `00:42:15` – `00:52:22` · S01-P1.mp4 — /proc filesystem
- `00:52:22` – `01:18:50` · S01-P1.mp4 — GDB
- `01:18:50` – `01:30:46` · S01-P1.mp4 — Endianness
- `00:00:00` – `00:09:45` · S01-P2.mp4 — GDB extensions
- `00:09:45` – `00:23:58` · S01-P2.mp4 — x86 registers and flags
- `00:23:58` – `00:38:58` · S01-P2.mp4 — Assembly instructions
- `00:38:58` – `01:18:16` · S01-P2.mp4 — 32-bit calling convention

### Session 02

- `00:00:00` – `00:27:23` · S02-P1.mp4 — Stack frames
- `00:27:23` – `00:36:54` · S02-P1.mp4 — Format string vulnerability
- `00:36:54` – `00:47:04` · S02-P1.mp4 — Compiler mitigations
- `00:47:04` – `01:04:35` · S02-P1.mp4 — PIE and ASLR
- `01:04:35` – `01:27:04` · S02-P1.mp4 — Out-of-bounds write
- `00:00:00` – `00:11:57` · S02-P2.mp4 — Stack buffer overflow
- `00:11:57` – `00:25:01` · S02-P2.mp4 — x64 calling convention
- `00:25:01` – `00:45:13` · S02-P2.mp4 — Linux kernel intro
- `00:45:13` – `00:56:35` · S02-P2.mp4 — Kernel source browsing
- `00:56:35` – `01:10:18` · S02-P2.mp4 — Kernel config and build
- `01:10:18` – `01:16:30` · S02-P2.mp4 — Booting custom kernel

### Session 03

- `00:00:00` – `00:24:43` · S03-P1.mp4 — Address space layout
- `00:24:43` – `01:05:42` · S03-P1.mp4 — Kernel config and build
- `01:05:42` – `01:17:44` · S03-P1.mp4 — QEMU virtio disk
- `01:17:44` – `01:25:35` · S03-P1.mp4 — Kernel GDB symbols
- `00:00:00` – `00:10:29` · S03-P2.mp4 — QEMU tap networking
- `00:10:29` – `00:19:14` · S03-P2.mp4 — strace and ltrace
- `00:19:14` – `00:42:45` · S03-P2.mp4 — File descriptors
- `00:42:45` – `00:49:26` · S03-P2.mp4 — Syscall ABI
- `00:49:26` – `01:06:55` · S03-P2.mp4 — Assembly syscalls

### Session 04

- `00:00:00` – `00:13:26` · S04-P1.mp4 — Syscall recap
- `00:13:26` – `00:32:03` · S04-P1.mp4 — stat syscalls
- `00:32:03` – `00:51:29` · S04-P1.mp4 — Syscall ABI
- `00:51:29` – `01:16:10` · S04-P1.mp4 — sys_call_table
- `01:16:10` – `01:25:27` · S04-P1.mp4 — vdso and vsyscall
- `00:00:00` – `00:09:10` · S04-P2.mp4 — Kernel modules
- `00:09:10` – `00:29:20` · S04-P2.mp4 — Hello kernel module
- `00:29:20` – `00:34:06` · S04-P2.mp4 — Loop device
- `00:34:06` – `00:46:02` · S04-P2.mp4 — EXPORT_SYMBOL

### Session 05

- `00:00:00` – `00:27:25` · S05-P1.mp4 — VFS
- `00:27:25` – `00:35:23` · S05-P1.mp4 — Major and minor numbers
- `00:35:23` – `00:50:39` · S05-P1.mp4 — dentry and inode
- `00:50:39` – `01:04:08` · S05-P1.mp4 — task_struct
- `01:04:08` – `01:22:46` · S05-P1.mp4 — fork and clone
- `00:00:00` – `00:11:28` · S05-P2.mp4 — Task linked list
- `00:11:28` – `00:26:52` · S05-P2.mp4 — procfs module
- `00:26:52` – `00:42:00` · S05-P2.mp4 — ftrace
- `00:42:00` – `01:01:12` · S05-P2.mp4 — function_graph
- `01:01:12` – `01:16:15` · S05-P2.mp4 — ftrace events

### Session 06

- `00:00:00` – `00:09:25` · S06-P1.mp4 — File integrity checks
- `00:09:25` – `00:16:51` · S06-P1.mp4 — VFS ftrace recap
- `00:16:51` – `00:42:46` · S06-P1.mp4 — ftrace hooks
- `00:42:46` – `00:53:18` · S06-P1.mp4 — Signal handling
- `00:53:18` – `01:01:13` · S06-P1.mp4 — Process states
- `01:01:13` – `01:20:00` · S06-P1.mp4 — Zombie processes
- `00:00:00` – `00:10:36` · S06-P2.mp4 — Task scheduling
- `00:10:36` – `00:18:17` · S06-P2.mp4 — Scheduling policies
- `00:18:17` – `00:47:45` · S06-P2.mp4 — task_struct priorities
- `00:47:45` – `00:57:19` · S06-P2.mp4 — IPC
- `00:57:19` – `01:11:54` · S06-P2.mp4 — POSIX shared memory

### Session 07

- `00:00:00` – `00:08:17` · S07-P1.mp4 — Per-CPU runqueues
- `00:08:17` – `00:12:34` · S07-P1.mp4 — Process sandboxing
- `00:12:34` – `00:41:08` · S07-P1.mp4 — seccomp
- `00:41:08` – `00:47:42` · S07-P1.mp4 — eBPF
- `00:47:42` – `00:57:18` · S07-P1.mp4 — bpftrace
- `00:57:18` – `01:16:50` · S07-P1.mp4 — systemd
- `00:00:00` – `00:08:31` · S07-P2.mp4 — PID 1 boot
- `00:08:31` – `01:05:24` · S07-P2.mp4 — Kernel threads
- `01:05:24` – `01:13:47` · S07-P2.mp4 — OOM killer

### Session 08

- `00:00:00` – `00:22:35` · S08-P1.mp4 — Digital forensics
- `00:22:35` – `00:32:07` · S08-P1.mp4 — Incident response
- `00:32:07` – `00:41:40` · S08-P1.mp4 — Live investigation
- `00:41:40` – `00:50:54` · S08-P1.mp4 — netcat transfer
- `00:50:54` – `01:18:57` · S08-P1.mp4 — Logger scripts
- `00:00:00` – `00:16:52` · S08-P2.mp4 — Sample log analysis
- `00:16:52` – `00:28:38` · S08-P2.mp4 — Live investigation
- `00:28:38` – `00:36:23` · S08-P2.mp4 — Memory acquisition
- `00:36:23` – `00:46:19` · S08-P2.mp4 — LiME
- `00:46:19` – `01:09:50` · S08-P2.mp4 — Volatility profiles

### Session 09

- `00:00:00` – `00:06:41` · S09-P1.mp4 — Live investigation
- `00:06:41` – `00:27:20` · S09-P1.mp4 — Volatility 3 ISF
- `00:27:20` – `00:38:57` · S09-P1.mp4 — Hidden kernel modules
- `00:38:57` – `00:46:59` · S09-P1.mp4 — bulk_extractor
- `00:46:59` – `01:01:08` · S09-P1.mp4 — Encrypted containers
- `01:01:08` – `01:11:34` · S09-P1.mp4 — sk_buff packets
- `01:11:34` – `01:18:00` · S09-P1.mp4 — User activity reconstruction
- `00:00:00` – `00:12:29` · S09-P2.mp4 — pslist and psenv
- `00:12:29` – `00:28:02` · S09-P2.mp4 — Bash history
- `00:28:02` – `00:43:46` · S09-P2.mp4 — Open files
- `00:43:46` – `00:53:35` · S09-P2.mp4 — Firefox history
- `00:53:35` – `00:58:34` · S09-P2.mp4 — USB mount timeline
- `00:58:34` – `01:03:51` · S09-P2.mp4 — TrueCrypt passphrase
- `01:03:51` – `01:07:25` · S09-P2.mp4 — setuid binary

### Session 10

- `00:00:00` – `00:13:58` · S10.mp4 — MemProcFS
- `00:13:58` – `00:28:41` · S10.mp4 — Virtual address space
- `00:28:41` – `00:34:40` · S10.mp4 — Physical memory layout
- `00:34:40` – `00:45:40` · S10.mp4 — Pages and frames
- `00:45:40` – `01:01:43` · S10.mp4 — Page faults
- `01:01:43` – `01:15:27` · S10.mp4 — Memory zones
- `01:15:27` – `01:24:05` · S10.mp4 — Buddy and slab
- `01:24:05` – `01:46:19` · S10.mp4 — kmalloc and vmalloc

### Session 11

- `00:00:00` – `00:13:45` · S11-P1.mp4 — ELF overview
- `00:13:45` – `00:26:54` · S11-P1.mp4 — ELF header
- `00:26:54` – `00:32:25` · S11-P1.mp4 — Entry point
- `00:32:25` – `00:49:57` · S11-P1.mp4 — Program headers
- `00:49:57` – `01:12:57` · S11-P1.mp4 — Segment types
- `01:12:57` – `01:21:26` · S11-P1.mp4 — Section headers
- `00:00:00` – `00:13:37` · S11-P2.mp4 — Section headers
- `00:13:37` – `00:26:53` · S11-P2.mp4 — Section types
- `00:26:53` – `00:32:41` · S11-P2.mp4 — Dynamic linking
- `00:32:41` – `00:51:41` · S11-P2.mp4 — PLT and GOT
- `00:51:41` – `01:12:30` · S11-P2.mp4 — Master boot record

### Session 12

- `00:00:00` – `00:15:23` · S12-P1.mp4 — MBR partition table
- `00:15:23` – `00:40:38` · S12-P1.mp4 — dd disk imaging
- `00:40:38` – `00:47:59` · S12-P1.mp4 — Mounting disk images
- `00:47:59` – `00:53:32` · S12-P1.mp4 — Extended partitions
- `00:53:32` – `01:11:51` · S12-P1.mp4 — UEFI Secure Boot
- `01:11:51` – `01:19:12` · S12-P1.mp4 — GPT partition layout
- `00:00:00` – `00:12:15` · S12-P2.mp4 — GPT partition parsing
- `00:12:15` – `00:34:28` · S12-P2.mp4 — VFS
- `00:34:28` – `00:39:00` · S12-P2.mp4 — Linux filesystem types
- `00:39:00` – `00:44:56` · S12-P2.mp4 — Journaling
- `00:44:56` – `00:51:28` · S12-P2.mp4 — Copy-on-write
- `00:51:28` – `01:03:15` · S12-P2.mp4 — ext filesystem blocks

### Session 13

- `00:00:00` – `00:12:15` · S13-P1.mp4 — ext4 on-disk layout
- `00:12:15` – `00:23:47` · S13-P1.mp4 — ext4 block groups
- `00:23:47` – `00:42:35` · S13-P1.mp4 — ext4 superblock
- `00:42:35` – `00:49:41` · S13-P1.mp4 — Inode number gaps
- `00:49:41` – `00:58:38` · S13-P1.mp4 — The Sleuth Kit
- `00:58:38` – `01:04:57` · S13-P1.mp4 — UAC collector
- `01:04:57` – `01:27:18` · S13-P1.mp4 — Apache honeypot case
- `00:00:00` – `00:07:41` · S13-P2.mp4 — icat file recovery
- `00:07:41` – `00:21:16` · S13-P2.mp4 — Process environment pivoting
- `00:21:16` – `00:43:17` · S13-P2.mp4 — Apache log analysis
- `00:43:17` – `00:48:47` · S13-P2.mp4 — Symbiote
- `00:48:47` – `00:56:13` · S13-P2.mp4 — BPFDoor
```