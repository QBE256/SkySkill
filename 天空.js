/*--------------------------------------------------------------------------
　天空（連続スキルの攻撃時に指定したスキルを発動させる） ver 1.1

■作成者
キュウブ

■概要
連続スキル発動後、攻撃ごとに指定された別のスキルが発動するようになります
つまり、天空（1撃目で太陽、2撃目で月光の2連続攻撃）も作成可能

■使い方
連続攻撃スキルに以下のカスパラを入れておくだけで良いです
continuousAttackInvodationSkillArray:[<1撃目で発動させたいスキルのID>, <2撃目で発動させたいスキルのID>, ... , <n番目で発動させたいスキルのID>]

例1: 1撃目で20番のスキル、2撃目で40番のスキルを発動させたい場合
continuousAttackInvodationSkillArray:[20,40]

例2: 1撃目で11番のスキル、2撃目で13番のスキル、3撃目に4番のスキルを発動させたい場合
continuousAttackInvodationSkillArray:[11,13,4]

※注意点
・カスパラで指定されたスキルは攻撃時に判定されるものでなければ発動しません
・指定されたスキルの"発動時に表示する"のチェックを外しておかないと発動演出が入ってしまいます
・本プラグインは"指定されたスキルをセットしているだけ"ですので発動条件を満たさない場合はただの通常攻撃になってしまいます
よって、該当スキルの発動確率は100%にしておく事推奨
・ユニットのスキル数が上限に達している場合は正常に動作しません。上限数を増やすかユニットの覚えているスキルを減らしてください。

■更新履歴
ver 1.1 (2017/10/01)
天空発動時にフリーズする可能性がある部分を修正

ver 1.0 (2017/10/01)
公開 

■対応バージョン
SRPG Studio Version:1.153

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/


(function(){

	var tempFunctions = {
		StructureBuilder: {
			buildVirtualAttackUnit: StructureBuilder.buildVirtualAttackUnit
		},
		NormalAttackOrderBuilder: {
			_getAttackCount: NormalAttackOrderBuilder._getAttackCount,
			_setDamage: NormalAttackOrderBuilder._setDamage
		}
	};

	StructureBuilder.buildVirtualAttackUnit = function() {
		var result = tempFunctions.StructureBuilder.buildVirtualAttackUnit.call(this);
		result.continuousAttackInvodationSkill = {
			isInvocation: false,
			attackCount: 0,
			skillArray: []
		};
		return result;
	};

	NormalAttackOrderBuilder._getAttackCount = function(virtualActive, virtualPassive) {
		var result = tempFunctions.NormalAttackOrderBuilder._getAttackCount.call(this, virtualActive, virtualPassive);

		this._setContinuousAttackInvodationSkill(virtualActive);

		return result;
        }

	NormalAttackOrderBuilder._setContinuousAttackInvodationSkill = function(virtualActive) {
		virtualActive.continuousAttackInvodationSkill.isInvocation = false;
		virtualActive.continuousAttackInvodationSkill.attackCount = 0;
		if (validateContinuousAttackInvodationSkillArrayCustomParameter(virtualActive.skillContinuousAttack) === true) {
			virtualActive.continuousAttackInvodationSkill.isInvocation = true;
			virtualActive.continuousAttackInvodationSkill.skillArray = virtualActive.skillContinuousAttack.custom.continuousAttackInvodationSkillArray;
		}
	};

	NormalAttackOrderBuilder._setDamage = function(virtualActive, virtualPassive) {
		var generator, skill, result;

		if (virtualActive.continuousAttackInvodationSkill.isInvocation === true && virtualActive.continuousAttackInvodationSkill.skillArray.length >= virtualActive.continuousAttackInvodationSkill.attackCount) {

			skill = root.getBaseData().getSkillList().getDataFromId(virtualActive.continuousAttackInvodationSkill.skillArray[virtualActive.continuousAttackInvodationSkill.attackCount]);

			if (skill) {
				generator = root.getEventGenerator();
				generator.skillChange(virtualActive.unitSelf, skill, IncreaseType.INCREASE, true);
				generator.execute();
			}

			virtualActive.continuousAttackInvodationSkill.attackCount++;

			result = tempFunctions.NormalAttackOrderBuilder._setDamage.call(this, virtualActive, virtualPassive);

			if (skill) {
				generator = root.getEventGenerator();
				generator.skillChange(virtualActive.unitSelf, skill, IncreaseType.DECREASE, true);
				generator.execute();
			}

			return result;
		} else {
			return tempFunctions.NormalAttackOrderBuilder._setDamage.call(this, virtualActive, virtualPassive);
		}
        };
})();

var validateContinuousAttackInvodationSkillArrayCustomParameter = function(skill) {
	if (!skill) {
		return false;
	}

	if (typeof skill.custom.continuousAttackInvodationSkillArray === 'object' &&
		typeof skill.custom.continuousAttackInvodationSkillArray.length === 'number' &&
		typeof skill.custom.continuousAttackInvodationSkillArray.splice === 'function' &&
		!(skill.custom.continuousAttackInvodationSkillArray.propertyIsEnumerable('length'))) {
		return true;
	}

	return false;
};