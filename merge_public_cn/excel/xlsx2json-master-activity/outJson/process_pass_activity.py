#!/usr/bin/env python3
import json

# 加载文件
with open('../json/PassActivity.json', 'r', encoding='utf-8') as f:
    pass_activity_list = json.load(f)

with open('../json/PassActivityTaskList.json', 'r', encoding='utf-8') as f:
    task_list_data = json.load(f)

with open('../json/PassActivityTask.json', 'r', encoding='utf-8') as f:
    task_data = json.load(f)

with open('../json/PassActivityLevelReward.json', 'r', encoding='utf-8') as f:
    level_reward_data = json.load(f)

# 处理每个活动
for activity in pass_activity_list:
    # 替换 dailyTaskListIds -> taskList（二维数组）
    if 'dailyTaskListIds' in activity:
        full_task_list = []
        for list_id in activity['dailyTaskListIds']:
            str_list_id = str(list_id)
            if str_list_id in task_list_data and 'taskList' in task_list_data[str_list_id]:
                task_ids = task_list_data[str_list_id]['taskList']
                full_task_list.append([task_data[str(tid)] for tid in task_ids if str(tid) in task_data])
        activity['taskList'] = full_task_list
        del activity['dailyTaskListIds']

    # 替换 levelRewardListIds -> levelRewardList（一维数组）
    if 'levelRewardListIds' in activity:
        activity['levelRewardList'] = [
            level_reward_data[str(rid)]
            for rid in activity['levelRewardListIds']
            if str(rid) in level_reward_data
        ]
        del activity['levelRewardListIds']

# 输出为 JSON 字符串格式（带双引号和转义）
json_str = json.dumps(pass_activity_list, ensure_ascii=False, separators=(',', ':'))
json_str_with_quotes = json.dumps(json_str, ensure_ascii=False)

# 打印结果
print("生成的 JSON 字符串如下：")
print(json_str_with_quotes)

# 保存到文件
with open('output_json_string.txt', 'w', encoding='utf-8') as f:
    f.write(json_str_with_quotes)

print("✅ 已生成完整嵌套结构的 JSON 字符串并保存到 output_json_string.txt")